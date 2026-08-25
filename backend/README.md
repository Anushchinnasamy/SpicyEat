# SpicyEat Backend

Java / Spring Boot microservices for SpicyEat. See
`../SPICYEAT_COMPLETE_BACKEND_MICROSERVICES_PLAN.md` for the full architecture plan.

## Phase A + B + C + notifications + E (built so far)

```text
api-gateway         -> :8080  (public entry point, JWT validation, routing, CORS, Redis rate limiting)
auth-service        -> :8081  (register/login/refresh/logout/me, JWT issuing, password reset)
user-service        -> :8082  (profile, addresses, favourites)
menu-service        -> :8083  (categories, menu items, addons; Redis cache-aside)
cart-service        -> :8084  (cart items, addons; revalidates against menu-service)
order-service       -> :8085  (checkout, order lifecycle, cancellation, reorder, timeline;
                                Kafka outbox producer + PAYMENT_SUCCEEDED consumer)
payment-service     -> :8086  (mock-provider charges, idempotency, refunds, webhook;
                                Kafka outbox producer, no more direct service calls)
delivery-service    -> :8087  (available/accept/pickup/start/complete, earnings;
                                PAYMENT_SUCCEEDED consumer creates the delivery record)
notification-service -> :8090 (transactional email via Resend, driven by Kafka for order/payment
                                events; port matches plan section 33's canonical assignment even
                                though offer/reward on 8088/8089 aren't built yet)
postgres            -> :5432  (one instance, one database per service)
redis               -> :6379  (menu-service cache, gateway rate limiter)
kafka               -> :9092  (KRaft mode, no ZooKeeper — apache/kafka:3.8.0)
```

Each service owns its own PostgreSQL database (`spicyeat_auth`, `spicyeat_user`,
`spicyeat_menu`, `spicyeat_cart`, `spicyeat_order`, `spicyeat_payment`,
`spicyeat_delivery`, `spicyeat_notification`) and manages its schema with
Flyway. Services never query another service's tables directly.

## Service-to-service calls (cart-service, order-service)

`cart-service` and `order-service` call other services synchronously over
OpenFeign (no Kafka yet — that's Phase E, and these calls need an immediate
answer):

- `cart-service` → `menu-service`: validates a menu item exists, is
  available, and fetches its authoritative price/addon prices whenever an
  item is added to the cart. The client never gets to set its own price.
- `order-service` → `cart-service`: fetches the cart at checkout, clears it
  after the order is created.
- `order-service` → `menu-service`: **revalidates** price and availability
  again at checkout time, even though the cart already validated once —
  prices can change between "add to cart" and "place order". This becomes
  the order's immutable pricing snapshot; menu price changes afterward never
  touch existing orders.
- `order-service` → `user-service`: fetches the chosen address and snapshots
  it onto the order, so editing/deleting the address later doesn't change
  past orders.

Every outgoing Feign call forwards the caller's `X-User-Id` / `X-User-Roles` /
`X-Correlation-Id` headers (`com.spicyeat.common.feign.ForwardedHeadersInterceptor`),
so a downstream "get my own cart" call is scoped to the same user as the
original request, and logs stay traceable across the hop.

## Order lifecycle

`PLACED → CONFIRMED → PREPARING → READY_FOR_PICKUP → ASSIGNED → PICKED_UP →
OUT_FOR_DELIVERY → DELIVERED`, plus `CANCELLED`. Transitions are enforced by
an explicit map in `OrderStatus` — see `canTransitionTo`. Customers can only
self-cancel from `PLACED` or `CONFIRMED` (`POST /api/orders/{id}/cancel`);
once preparation starts, cancellation is no longer offered here. `POST
/api/orders/{id}/status` (admin-only) advances an order along the pipeline.

**Operational gap found during Phase C smoke testing, still not fixed:**
`delivery-service` mirrors its own state onto the order
(`ASSIGNED`/`PICKED_UP`/`OUT_FOR_DELIVERY`/`DELIVERED`) by calling `POST
/api/orders/{id}/status` directly (still a synchronous REST call, deliberately
not converted to Kafka in the Phase E pass — see the Kafka section below for
why). That call is rejected (409) unless the order has already been walked
through `PREPARING → READY_FOR_PICKUP` first — and nothing does that
automatically today. In practice this means: right after payment succeeds
(which now reliably creates the delivery record via Kafka — see below), an
admin must call `POST /api/orders/{id}/status` with `PREPARING` then
`READY_FOR_PICKUP` *before* a delivery partner accepts, or every one of
delivery-service's status-mirroring calls will fail (caught, logged, silently
swallowed — see `mirrorOrderStatus`) and the order will stay stuck at
`CONFIRMED` even though the delivery completed fine on its own side. There's
no kitchen-status integration to drive this automatically, and no error
surfaces to the delivery partner when it happens. Treat this as a known
manual step; it would need either a kitchen-status source of truth or folding
delivery's status mirroring into the same outbox/Kafka pattern used
elsewhere, which was out of scope for "fast."

## Payment: mock provider, idempotency, and internal fan-out

`payment-service` never lets the client assert success — every decision comes
from `MockPaymentProvider`, standing in for a real gateway SDK:

- `POST /api/payments` requires an `Idempotency-Key` header. A repeated
  request with the same key (same user) returns the original payment instead
  of charging again; reusing a key with a *different* `orderId` is rejected
  (409) rather than silently accepted.
- Two amounts are reserved to make the provider's decision deterministic in
  tests: `13.13` always fails, `99.99` always defers to `PROCESSING` until a
  `POST /api/payments/{id}/verify` call resolves it — a stand-in for a
  provider that settles asynchronously, without needing real polling
  infrastructure.
- `POST /api/payments/webhook` simulates a provider callback and is
  idempotent by `eventId`: a redelivered webhook is a safe no-op
  (`processed_webhook_events` table). It's the one payment route the gateway
  treats as public, since a real provider has no SpicyEat JWT to send —
  signature verification against a provider secret is the next step before
  this could be a real integration, intentionally out of scope here.
- `POST /api/payments/{id}/refund` is admin-only, validates the refund
  doesn't exceed the remaining refundable balance, and moves the payment to
  `REFUNDED` or `PARTIALLY_REFUNDED`.

When a charge resolves to `SUCCESS` or `FAILED` (at charge time, at
`/verify`, or via the webhook), `payment-service` no longer calls
`order-service` or `delivery-service` directly — **this was the project's
biggest documented gap and Phase E's Kafka/outbox work retires it.** See the
Kafka section below for exactly how.

## Kafka: the outbox pattern, and what it replaced

Two topics, `spicyeat.order.events` and `spicyeat.payment.events`, both on a
single-broker KRaft-mode Kafka (`apache/kafka:3.8.0`, no ZooKeeper — simplest
thing that behaves like real Kafka for local dev). Every message is a
`com.spicyeat.common.event.EventEnvelope`
(`eventId`/`eventType`/`occurredAt`/`version`/`aggregateId`/`payload`,
plan section 16) serialized as JSON, keyed by `aggregateId` (the order or
payment's own id) so all events for one aggregate land on the same partition
in order.

**Producers use the outbox pattern (plan section 17), not a bare
`kafkaTemplate.send()` at the point of the business change.** `order-service`
and `payment-service` each have their own `outbox_events` table (same
database, not shared across services). Every status change / charge
resolution writes an `OutboxEvent` row in the *same transaction* as the
business write — `OutboxRecorder.record(...)` deliberately has no
`@Transactional` of its own so it joins whatever transaction is already open.
A separate `@Scheduled(fixedDelay = 2000)` `OutboxPublisher` polls
`WHERE published = false`, sends each row to Kafka, and only marks it
published after a successful send. This is what makes "DB commit succeeds,
Kafka publish fails" (the exact failure mode plan section 17 names)
impossible to hit silently: either both commit, or the outbox row sits there
unpublished until the next poll — nothing is ever lost to a crash between the
two steps. A crash between "Kafka acked" and "marked published" causes a
harmless duplicate delivery instead, which is why every consumer below is
idempotent by `eventId` (a `processed_events` table, same shape everywhere,
mirroring the `processed_webhook_events` dedup already in `payment-service`
since Phase C).

`order-service` publishes on *every* status change — `ORDER_PLACED`,
`ORDER_CONFIRMED`, `ORDER_PREPARING`, `ORDER_READY_FOR_PICKUP`,
`ORDER_ASSIGNED`, `ORDER_PICKED_UP`, `ORDER_OUT_FOR_DELIVERY`,
`ORDER_DELIVERED`, `ORDER_CANCELLED` (event type is just `"ORDER_" +
status.name()`, no manual mapping table to keep in sync). `payment-service`
publishes `PAYMENT_SUCCEEDED`, `PAYMENT_FAILED`, `REFUND_PROCESSED`.
Consumers only react to the subset they care about and ignore the rest.

**What this replaced**, concretely:

- `payment-service` → `order-service` (`POST /{id}/status` to `CONFIRMED`)
  and `payment-service` → `delivery-service` (`POST /api/delivery` to create
  the delivery) were direct Feign calls, best-effort/logged-on-failure. Both
  are gone. `payment-service` doesn't hold Feign clients to either service
  anymore — it just writes to its own outbox. `order-service`'s
  `PaymentEventListener` and `delivery-service`'s `PaymentEventListener` each
  independently consume `PAYMENT_SUCCEEDED` and do their own idempotent
  reaction (`advanceStatus(orderId, CONFIRMED)` / `createForOrder(orderId)`).
  Neither knows the other exists, and neither knows `payment-service` beyond
  "something published this event."
- `order-service`/`payment-service` calling `notification-service`'s REST
  endpoint directly for `ORDER_PLACED`/`ORDER_CONFIRMED`/
  `ORDER_OUT_FOR_DELIVERY`/`PAYMENT_SUCCEEDED`/`PAYMENT_FAILED`/
  `REFUND_PROCESSED` — six of the seven notification types — is gone too.
  `notification-service`'s `DomainEventListener` consumes both topics;
  `NotificationType.valueOf(eventType)` throwing is how event types nobody
  emails for (`ORDER_PREPARING`, `ORDER_CANCELLED`, ...) get skipped without
  a mapping table. `PASSWORD_RESET` is the one type that still arrives via
  the REST endpoint, because it isn't really a domain event — it's a direct
  command from `auth-service` with no other plausible source.

**What's deliberately still synchronous, and why:** `cart-service` →
`menu-service` (price/availability check needs an immediate answer to reject
a bad add-to-cart), `order-service` → `cart-service`/`menu-service`/
`user-service` at checkout (same reason — checkout has to know *now* whether
the order is valid), and `delivery-service` → `order-service` status
mirroring (see the operational-gap note above — converting this one to Kafka
too was in scope for "properly fixing" the gap but not for "fast").

## Redis: menu caching and gateway rate limiting

`menu-service` caches `listCategories()`, `getById()`, `getBySlug()`, and
`listItems()` (cache-aside, plan section 19's exact example) via Spring's
`@Cacheable`/`@CacheEvict`, 5-minute TTL, JSON-serialized values
(`GenericJackson2JsonRedisSerializer` — the entities aren't `Serializable`,
so the default JDK serializer would fail). Every admin write
(create/update/delete/availability) evicts broadly (`allEntries = true`)
rather than surgically — correctness over precision, since writes here are
rare and the worst case without eviction is just a stale 5-minute TTL. A
custom `CacheErrorHandler` (`CacheConfig`) logs and swallows Redis failures
instead of letting them propagate as 500s — plan section 19's "Redis
unavailable → degrade gracefully to the database" is a real behavior here,
not just a comment; kill the `redis` container and `menu-service` keeps
serving correctly, just uncached.

`api-gateway` applies a Redis-backed `RequestRateLimiter` as a
`default-filter` (so it covers every route, not just one), keyed by the
caller's verified `X-User-Id` when authenticated, falling back to remote
address for anonymous requests like login — otherwise every anonymous caller
behind the same NAT would share one bucket. Defaults: 20 req/s sustained, 40
burst (`RATE_LIMIT_REPLENISH_PER_SEC` / `RATE_LIMIT_BURST` env vars).

## Resilience4j: circuit breakers and retries on the checkout path

`order-service`'s calls to `menu-service` and `user-service` during checkout,
and `cart-service`'s calls to `menu-service` when adding an item, go through
a circuit breaker + retry (`ResilientDependencyClient` /
`ResilientMenuClient`). Two things worth knowing if you're reading the code:

1. **These live on their own `@Component`, not as annotated private methods
   on `OrderService`/`CartService`.** Resilience4j's annotations rely on
   Spring's proxy-based AOP, which only intercepts calls arriving through a
   bean's proxy — a class calling its own private method never goes through
   the proxy, so the annotation would silently do nothing. This bit me while
   building it; worth remembering for any future annotation-based
   cross-cutting concern in this codebase.
2. **`ApiException` is explicitly in every `ignoreExceptions` list.** Without
   that, a legitimate business rejection (item not found, address not found)
   would count as a circuit-breaker failure and get retried — retrying "this
   item doesn't exist" three times before giving up is both wrong and slow.
   Only real dependency failures (timeouts, connection errors, 5xx) trip the
   breaker or trigger a retry, and only `GET`s are wrapped — never a
   non-idempotent call (plan section 22's explicit rule).

## Observability: correlation IDs, structured logs, Prometheus

`CorrelationIdMdcFilter` (in `common`, so every servlet-based service picks
it up automatically via component scan) copies the gateway-assigned
`X-Correlation-Id` onto the logging MDC — the `[%X{correlationId}]` segment
already present in every service's `logging.pattern` was silently printing
`[]` before this pass; now it actually carries the id, so one request's logs
are greppable across every service it touched.

Every service exposes `/actuator/prometheus` (added `micrometer-registry-prometheus`
everywhere). No Prometheus server or Grafana dashboard is wired up in this
repo — that's the next layer, not built here — but the metrics themselves
(request count, latency, JVM, HikariCP pool stats, and now Kafka
consumer/producer metrics via Micrometer's Kafka binder) are already there to
scrape. Distributed tracing is still explicitly deferred, per the plan.

## Delivery: claiming, the race condition, and earnings

`delivery-service` collapses the plan's `ASSIGNED`/`ACCEPTED` states into one
`ASSIGNED` state, since there's a single `POST /api/delivery/{id}/accept`
action rather than a separate system-assigns-then-partner-confirms flow.

The "two partners race to accept the same delivery" scenario (plan section 20)
is handled without a distributed lock: `DeliveryRepository.claim(...)` is a
conditional `UPDATE ... WHERE status = 'UNASSIGNED'`. Exactly one concurrent
request affects a row; the other sees `0` rows updated and gets a 409. Every
delivery endpoint (`accept`/`pickup`/`start`/`complete`) also checks the
caller is the partner the delivery is actually assigned to.

Each `pickup`/`start`/`complete` call also updates the order's status to
match (`ASSIGNED`/`PICKED_UP`/`OUT_FOR_DELIVERY`/`DELIVERED` — the enum values
are deliberately identical between the two services). Completing a delivery
records a flat $5.00 `Earning` row for the partner; `GET
/api/delivery/earnings` lists them.

## Notifications: Resend, and how the seven trigger points work

`notification-service` owns exactly one job: given `{type, userId, data}`, resolve
the recipient's email (by calling `auth-service`'s `GET
/api/auth/internal/users/{id}`), render the right template, send it through
[Resend](https://resend.com), and record what happened in `notification_log`
— regardless of whether the send actually succeeded. It has no notion of
orders, payments, or deliveries; the seven `NotificationType` values and their
`data` maps are the entire contract.

As of Phase E, six of the seven trigger points are Kafka consumption, not a
direct call — see the Kafka section above for the full "what this replaced"
story. `PASSWORD_RESET` is the sole holdout, a direct REST call, because it
isn't a domain event:

| Type | Published/called by | Where | Delivery mechanism |
|---|---|---|---|
| `PASSWORD_RESET` | `auth-service` | `POST /api/auth/forgot-password`, if the email exists | direct REST call (best-effort, logged on failure) |
| `ORDER_PLACED` | `order-service` | end of `buildOrder()` — fires for both checkout and reorder | Kafka (`spicyeat.order.events`, outbox) |
| `ORDER_CONFIRMED` | `order-service` | `advanceStatus()` when the new status is `CONFIRMED` | Kafka (`spicyeat.order.events`, outbox) |
| `ORDER_OUT_FOR_DELIVERY` | `order-service` | `advanceStatus()` when the new status is `OUT_FOR_DELIVERY` | Kafka (`spicyeat.order.events`, outbox) |
| `PAYMENT_SUCCEEDED` | `payment-service` | charge, verify, or webhook resolving to `SUCCESS` | Kafka (`spicyeat.payment.events`, outbox) |
| `PAYMENT_FAILED` | `payment-service` | charge, verify, or webhook resolving to `FAILED` | Kafka (`spicyeat.payment.events`, outbox) |
| `REFUND_PROCESSED` | `payment-service` | end of `refund()` | Kafka (`spicyeat.payment.events`, outbox) |

`ORDER_CONFIRMED` and `ORDER_OUT_FOR_DELIVERY` are published from
`order-service`'s `advanceStatus()` rather than from wherever triggered the
transition — that's the single choke point every path through the state
machine passes through (admin call, payment's Kafka-driven auto-confirm,
delivery's status mirroring), so the event fires no matter which caller
drove it.

### Password reset (new in this pass)

`auth-service` didn't have this flow before. Added: `PasswordResetToken`
(opaque, hashed, 30-minute TTL, single-use — same shape as refresh tokens),
`POST /api/auth/forgot-password` (always 202, even for an unregistered email —
returning 404 there would let anyone enumerate registered addresses),
`POST /api/auth/reset-password` (validates + consumes the token, updates the
password, and **revokes every refresh token the user has** so a stolen
session can't survive a password reset). Both endpoints are public through
the gateway (no JWT — the user isn't authenticated at this point).

### Configuring Resend

```bash
RESEND_API_KEY=re_your_key_here
RESEND_FROM_ADDRESS="SpicyEat <onboarding@resend.dev>"   # or your verified domain
```

Put these in a `.env` file next to `podman-compose.yml` (docker/podman compose
reads it automatically) or export them before `podman compose up`. **Without
`RESEND_API_KEY` set, the service still starts and still logs every attempt**
— `ResendEmailClient` just records `status: FAILED, failureReason:
"RESEND_API_KEY is not configured"` instead of crashing or blocking the
caller. That graceful-degradation choice mirrors how the plan asks Redis to
behave when unavailable (section 19) — notification delivery is not
something a checkout or a payment should ever depend on succeeding.

## Internal service-to-service trust model

`order-service`'s `POST /{id}/status`, `delivery-service`'s `POST
/api/delivery` (create), `auth-service`'s `GET /internal/users/{id}`, and
`notification-service`'s `POST /api/notifications` all require the `ADMIN`
role — enforced the same way as every other role check, by reading the
`X-User-Roles` header. Two kinds of caller can supply that header honestly:

1. A real admin, through the gateway, which verified their JWT and attached
   the header itself.
2. Another backend service (`payment-service`, `delivery-service`,
   `order-service`, `auth-service`) calling directly over the private
   network, bypassing the gateway entirely — the same pattern already used
   for cart/menu/user lookups in Phase B. These calls self-assert
   `X-User-Roles: ADMIN` via
   `com.spicyeat.common.feign.InternalServiceCallInterceptor`.

This only holds together because the gateway is the sole *public* entry
point (plan section 5) — nothing stops a service on the private network from
asserting any header it wants, which is exactly why none of these internal
ports should ever be exposed outside the compose/Podman network. There's no
mTLS or service identity here; that's a deliberate simplification for a
learning project (plan section 23 makes the same call for service discovery),
not a production-ready trust boundary.

## How authentication flows

1. The browser talks only to the gateway (`:8080`).
2. `auth-service` issues a short-lived JWT (HMAC-signed, `spicyeat.jwt.secret`)
   plus an opaque, rotating refresh token (hashed at rest).
3. The gateway is the only component that verifies the JWT. On success it
   strips any client-supplied `X-User-Id` / `X-User-Roles` headers and replaces
   them with the verified identity before forwarding the request downstream.
4. Downstream services trust those headers because the gateway is the sole
   public entry point — see `com.spicyeat.common.security.CurrentUser`.

Public (no token required): `POST /api/auth/register`, `POST /api/auth/login`,
`POST /api/auth/refresh`, `POST /api/auth/forgot-password`, `POST
/api/auth/reset-password`, `GET /api/menu/**`, `POST /api/payments/webhook`.
Everything else requires `Authorization: Bearer <token>`.

## Running locally with Podman

```bash
cd backend
mvn clean package -DskipTests
podman compose -f podman-compose.yml up --build
```

This starts Postgres (creating all eight databases via
`infrastructure/postgres/init-databases.sh`), Redis, Kafka, then the eight
services, then the gateway. Flyway migrations run automatically on each
service's startup. Set `RESEND_API_KEY` (see the notifications section above)
if you want real emails to go out; otherwise notification-service still runs
and logs every attempt as `FAILED`.

Kafka topics are auto-created on first publish (`KAFKA_AUTO_CREATE_TOPICS_ENABLE:
"true"` in `podman-compose.yml`) — fine for local dev, not something you'd
rely on in production (explicit topic creation with a defined partition count
and replication factor belongs in the Railway/production setup instead).

Frontend should point `VITE_API_BASE_URL` at `http://localhost:8080`.

## Running a single service without containers

```bash
cd auth-service
mvn spring-boot:run
```

Requires a local Postgres reachable at the `DB_URL` in `application.yml`
(defaults to `localhost:5432`), or override with env vars:

```bash
DB_URL=jdbc:postgresql://localhost:5432/spicyeat_auth \
DB_USERNAME=spicyeat DB_PASSWORD=spicyeat \
mvn spring-boot:run
```

## Building everything

```bash
cd backend
mvn clean install
```

Builds `common` first (shared error DTOs, `ApiException`, `CurrentUser`), then
each service module.

## CI/CD

`.github/workflows/backend-ci.yml` (repo root, not under `backend/` — GitHub
only looks in `.github/workflows` at the repository root regardless of
monorepo layout):

- Every push/PR touching `backend/**`: `mvn clean verify` across all modules
  on GitHub-hosted `ubuntu-latest` (Testcontainers-capable if/when real tests
  get written — see "Known gaps" below, there aren't any yet).
- On push to `main` only, after the build/test job passes: builds and pushes
  each service's container image to GHCR
  (`ghcr.io/<owner>/spicyeat-<service>:<sha>` and `:latest`), one matrix job
  per service, using each service's existing `Containerfile`.

No deployment step exists yet — see Production Deployment below for why.

## Production deployment (Railway + Supabase) — prepared, not provisioned

The plan's target (section 34) is Vercel → Railway API Gateway → Railway
microservices → Supabase PostgreSQL. This repo is structured for that
(one `Containerfile` per service already OCI-compatible, all configuration
externalized via env vars, nothing hardcoded) but **nothing has actually been
deployed** — that needs a Railway account, a Supabase project, and API
credentials this environment doesn't have. What's ready for whoever does have
those:

1. **Supabase**: create one Postgres instance, then either one logical
   database per service (matching local dev) or one database with per-service
   schemas (plan section 35 allows either — "services own their data" is the
   only non-negotiable part). Get the connection string per service.
2. **Railway**: one Railway service per SpicyEat service, each pointed at its
   GHCR image (`ghcr.io/<owner>/spicyeat-<service>:latest`, published by CI
   above) or built directly from the `Containerfile` via Railway's own
   builder. Every env var this README documents per service (`DB_URL`,
   `JWT_SECRET`, `*_SERVICE_URI` pointing at the other Railway services'
   internal hostnames, `KAFKA_BOOTSTRAP_SERVERS`, `REDIS_HOST`/`REDIS_PORT`,
   `RESEND_API_KEY`) needs to be set as Railway environment variables — none
   of it is baked into the images.
3. **Kafka + Redis in production**: Railway doesn't run arbitrary containers
   as first-class managed services the way it does Postgres; the practical
   options are a managed Kafka (Confluent Cloud, Upstash Kafka) and managed
   Redis (Upstash, Railway's own Redis plugin), swapped in purely via
   `KAFKA_BOOTSTRAP_SERVERS`/`REDIS_HOST`/`REDIS_PORT` — no code changes
   needed, that's the point of externalizing them.
4. **CORS + JWT secret**: `CORS_ALLOWED_ORIGINS` must be the real Vercel
   frontend URL, not `localhost:5192` (plan rule: never wildcard CORS for
   authenticated production traffic). `JWT_SECRET` must be a real random
   secret, not the `dev-only-...` default — set it once in Railway and reuse
   the same value for every service that validates or issues tokens
   (`api-gateway`, `auth-service`).
5. **api-gateway is the only service that should get a public Railway
   domain.** Every other service should stay on Railway's private network —
   the entire internal-trust model (see above) depends on that being true.

## Known gaps against the plan (honest summary)

- **No automated tests exist anywhere in this repo.** Plan section 30 asks
  for unit/repository/controller/integration/contract/event/e2e tests; none
  were written across Phases A–E. `mvn verify` in CI currently passes
  trivially because there's nothing to run. This is the single biggest gap
  between this codebase and the plan's definition of done (section 45).
- Delivery-service's order-status mirroring is still synchronous and still
  requires a manual `PREPARING → READY_FOR_PICKUP` admin step (see above) —
  deliberately not converted to Kafka in this pass.
- No transactional outbox on `auth-service` (password reset), `cart-service`,
  `user-service`, `menu-service`, or `delivery-service` — only `order-service`
  and `payment-service` publish events, because those were the two services
  with a documented gap to fix. Any future domain event from the others would
  need the same `OutboxEvent`/`OutboxRecorder`/`OutboxPublisher` trio added.
- No Kafka topic partitioning/replication strategy, no dead-letter topic for
  consumers that keep failing, no consumer lag alerting.
- Distributed tracing (OpenTelemetry) — plan explicitly defers this to
  "later," so it's still not here.
- offer-service and reward-service (Phase D) remain entirely unbuilt.
- Actual Railway/Supabase deployment — see above, needs credentials this
  environment doesn't have.
- **Bug found during Phase E smoke testing, not yet fixed:** `POST
  /api/orders` (checkout) can return `500` even though the order was created
  successfully. `OrderService.checkout()` calls `cartServiceClient.clearCart()`
  *after* the order (and its `ORDER_PLACED` outbox event) has already
  committed in `order-service`'s own local transaction — cart-service has its
  own separate database and transaction (correctly, per plan section 18's "no
  distributed transactions across services"), so a failure clearing the cart
  cannot roll back the order. The client sees an error for an order that
  actually went through. Reproduced live: `cart-service`'s
  `deleteByCartId`/`deleteByCartItemId` threw
  `ObjectOptimisticLockingFailureException` (likely a genuine concurrent
  double-request during testing, not something inherent to normal traffic),
  and the order was confirmed to exist and its outbox event confirmed
  published despite the 500. Fix would be either not failing the whole
  request on a cart-clear error (log and continue — the cart being non-empty
  after a successful checkout is cosmetic, not correctness-critical) or
  making cart-clearing a Kafka consumer reacting to `ORDER_PLACED` instead of
  a synchronous call in the checkout path.

## What's next

Per the plan's development order: offer-service and reward-service (the rest
of Phase D), then closing the gaps listed immediately above — tests being
the most consequential one. Do not build multiple phases simultaneously —
see plan section 4.
