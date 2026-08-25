# SpicyEat — Complete Backend & Microservices Plan

## 0. Project Goal

Build SpicyEat as a production-style, single-brand food ordering platform and use it as a serious learning project for Java, Spring Boot, microservices, system design, distributed systems, containerization, and cloud deployment.

Roles:
1. CUSTOMER
2. ADMIN
3. DELIVERY_PARTNER

There are **no restaurants** as marketplace entities.

---

## 1. Target Architecture

```text
React / Vercel
      |
      v
API Gateway (Spring Cloud Gateway)
      |
      +--> Auth Service ------ Auth DB
      +--> User Service ------ User DB
      +--> Menu Service ------ Menu DB
      +--> Cart Service ------ Cart DB
      +--> Order Service ----- Order DB
      +--> Payment Service --- Payment DB
      +--> Delivery Service -- Delivery DB
      +--> Offer Service ----- Offer DB
      +--> Reward Service ---- Reward DB
      +--> Notification Service
                         |
                         v
                      Kafka
```

Production target:

```text
Vercel
  |
  v
Railway API Gateway
  |
  v
Railway Spring Boot microservices
  |
  +--> Supabase PostgreSQL
  +--> Redis
  +--> Kafka
```

Local development:

```text
Windows
  |
  v
Podman
  +--> Gateway
  +--> Auth
  +--> User
  +--> Menu
  +--> Cart
  +--> Order
  +--> Payment
  +--> Delivery
  +--> Offer
  +--> Reward
  +--> Notification
  +--> PostgreSQL
  +--> Redis
  +--> Kafka
```

---

# 2. Architectural Principles

## Database per service

Each service owns its data. Services must never directly query another service's database.

Suggested logical ownership:

```text
Auth        -> credentials / refresh sessions
User        -> profiles / addresses / favourites
Menu        -> categories / menu items / addons
Cart        -> carts / cart items
Order       -> orders / order items / pricing snapshots
Payment     -> payments / transactions / refunds
Delivery    -> partners / assignments / locations
Offer       -> offers / coupons / usage
Reward      -> coins / reward transactions / redemptions
Notification-> notification records if persistence is needed
```

A shared physical PostgreSQL deployment can be used initially with separate schemas, but service ownership must remain strict.

## API Gateway

The browser should call only the gateway.

```text
Browser -> Gateway -> Internal Service
```

Gateway responsibilities:
- routing
- CORS
- JWT filtering
- rate limiting
- correlation IDs
- request logging
- security headers
- optional resilience policies

Do not put business logic in the gateway.

## Communication

Use synchronous communication when an immediate answer is required.

Use asynchronous Kafka events when work can be decoupled.

Do not introduce Kafka merely because the architecture is microservices.

---

# 3. Technology Stack

## Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Bean Validation
- Spring Cloud Gateway
- OpenFeign where useful
- Resilience4j
- Flyway
- PostgreSQL
- Redis
- Apache Kafka
- JUnit 5
- Mockito
- Testcontainers
- OpenAPI / Swagger
- OpenTelemetry later

## Containers

- Podman
- Podman Compose / Compose-compatible tooling
- OCI-compatible container images

Do not require Docker Desktop.

## Database

- PostgreSQL
- Supabase PostgreSQL for managed production persistence

## Frontend

Existing:
- React
- TypeScript
- Vite
- Vercel

The frontend should communicate with the backend through the API Gateway.

## First deployment target

**Railway**

Alternative:

**Render**

---

# 4. Microservices

Build these services:

```text
api-gateway
auth-service
user-service
menu-service
cart-service
order-service
payment-service
delivery-service
offer-service
reward-service
notification-service
```

Build progressively:

### Phase A
Gateway, Auth, User, Menu

### Phase B
Cart, Order

### Phase C
Payment, Delivery

### Phase D
Offer, Reward, Notification

### Phase E
Kafka, Redis, resilience, observability, production deployment

Do not implement all services simultaneously.

---

# 5. API Gateway

Routes:

```text
/api/auth/**           -> auth-service
/api/users/**          -> user-service
/api/menu/**           -> menu-service
/api/cart/**           -> cart-service
/api/orders/**         -> order-service
/api/payments/**       -> payment-service
/api/delivery/**       -> delivery-service
/api/offers/**         -> offer-service
/api/rewards/**        -> reward-service
/api/notifications/**  -> notification-service
```

Only the gateway should normally be public in production.

---

# 6. Auth Service

Own identity and authentication.

Entities:

```text
UserCredential
Role
RefreshToken / TokenSession
```

Responsibilities:
- registration
- login
- password hashing
- JWT access tokens
- refresh tokens
- logout/revocation
- account status
- roles

Roles:

```text
CUSTOMER
ADMIN
DELIVERY_PARTNER
```

Endpoints:

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

Security:
- BCrypt or Argon2 password hashing
- short-lived access tokens
- refresh token rotation
- secure token handling
- minimal JWT claims
- never expose password hashes

JWT claims can include:

```text
sub
role
iat
exp
jti
```

---

# 7. User Service

Own:

```text
UserProfile
Address
Favourite
UserPreference
```

Endpoints:

```http
GET    /api/users/me
PUT    /api/users/me

GET    /api/users/me/addresses
POST   /api/users/me/addresses
PUT    /api/users/me/addresses/{id}
DELETE /api/users/me/addresses/{id}

GET    /api/users/me/favourites
POST   /api/users/me/favourites/{menuItemId}
DELETE /api/users/me/favourites/{menuItemId}
```

Auth owns identity. User owns profile data.

---

# 8. Menu Service

Source of truth for the food catalogue.

Categories:

```text
BURGERS
FRIED_CHICKEN
PIZZA
WRAPS_ROLLS
LOADED
PASTA
SIDES
DESSERTS
```

No beverages.
No Chinese category.
No restaurant entity.

Entities:

```text
Category
MenuItem
MenuItemImage
Addon
Customization
SpiceLevel
Availability
```

Menu item should support:

```text
id
categoryId
name
slug
description
price
spiceLevel
vegetarian
available
featured
imageUrl
displayOrder
createdAt
updatedAt
```

Endpoints:

```http
GET    /api/menu
GET    /api/menu/categories
GET    /api/menu/{id}
GET    /api/menu/slug/{slug}
GET    /api/menu/search?q=
POST   /api/menu
PUT    /api/menu/{id}
DELETE /api/menu/{id}
POST   /api/menu/{id}/availability
GET    /api/menu/{id}/addons
```

Admin-only mutations.

---

# 9. Cart Service

Entities:

```text
Cart
CartItem
CartItemAddon
```

Responsibilities:
- add/remove items
- quantity
- customizations
- subtotal
- availability validation
- clear cart

Endpoints:

```http
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/{id}
DELETE /api/cart/items/{id}
DELETE /api/cart
```

Never trust frontend prices. Revalidate pricing against the Menu Service during checkout.

---

# 10. Order Service

Core business service.

Entities:

```text
Order
OrderItem
OrderItemAddon
OrderStatusHistory
OrderAddressSnapshot
PricingSnapshot
```

Order lifecycle:

```text
PLACED
  -> CONFIRMED
  -> PREPARING
  -> READY_FOR_PICKUP
  -> ASSIGNED
  -> PICKED_UP
  -> OUT_FOR_DELIVERY
  -> DELIVERED
```

Cancellation must have explicit rules.

Example:

```text
PLACED -> CANCELLED
CONFIRMED -> CANCELLED
PREPARING -> restricted
READY_FOR_PICKUP -> normally not cancellable
OUT_FOR_DELIVERY -> not cancellable
DELIVERED -> terminal
```

Endpoints:

```http
POST /api/orders
GET  /api/orders
GET  /api/orders/{id}
POST /api/orders/{id}/cancel
GET  /api/orders/{id}/timeline
POST /api/orders/{id}/reorder
```

Store purchase-time snapshots:

```text
product name
product price
addons
delivery address
discount
fees
tax
total
```

Old orders must not change when menu prices change.

---

# 11. Payment Service

Entities:

```text
Payment
PaymentAttempt
PaymentTransaction
Refund
```

Statuses:

```text
INITIATED
PROCESSING
SUCCESS
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

Endpoints:

```http
POST /api/payments
GET  /api/payments/{id}
POST /api/payments/{id}/verify
POST /api/payments/{id}/refund
```

System-design requirements:
- idempotency keys
- retries
- timeouts
- provider verification
- webhook verification
- duplicate webhook protection
- reconciliation

Never assume a client-side payment request means payment succeeded.

---

# 12. Delivery Service

Entities:

```text
DeliveryPartner
Delivery
DeliveryAssignment
PartnerLocation
DeliveryStatusHistory
Earnings
```

States:

```text
UNASSIGNED
ASSIGNED
ACCEPTED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
FAILED
```

Endpoints:

```http
GET  /api/delivery/available
POST /api/delivery/{id}/accept
POST /api/delivery/{id}/pickup
POST /api/delivery/{id}/start
POST /api/delivery/{id}/complete
GET  /api/delivery/active
GET  /api/delivery/history
GET  /api/delivery/earnings
```

Delivery partners can access only their own assignments/data.

---

# 13. Offer Service

Entities:

```text
Offer
Coupon
OfferRule
OfferUsage
```

Examples:

```text
FIRST_ORDER
WEEKEND_HEAT
20_PERCENT_OFF
FREE_DELIVERY
COMBO_DEAL
```

Endpoints:

```http
GET  /api/offers
GET  /api/offers/{id}
POST /api/offers/validate
POST /api/offers
PUT  /api/offers/{id}
DELETE /api/offers/{id}
```

Offer validation is server-side.

---

# 14. Reward Service

Own Spicy Coins.

Entities:

```text
RewardAccount
RewardTransaction
Reward
RewardRedemption
```

Endpoints:

```http
GET  /api/rewards/balance
GET  /api/rewards/history
GET  /api/rewards/catalog
POST /api/rewards/redeem
```

Example:

```text
ORDER_DELIVERED
      |
      v
Kafka
      |
      v
Reward Service
      |
      v
Credit Spicy Coins
```

---

# 15. Notification Service

Handles:

```text
Email
SMS
Push
```

Consume events such as:

```text
USER_REGISTERED
ORDER_PLACED
ORDER_CONFIRMED
ORDER_PREPARING
ORDER_OUT_FOR_DELIVERY
ORDER_DELIVERED
PAYMENT_FAILED
REWARD_EARNED
```

Prefer event-driven notification rather than tightly coupling every business service to notification APIs.

---

# 16. Kafka Architecture

Initial events:

```text
UserRegistered
OrderPlaced
OrderConfirmed
OrderPreparing
OrderReady
OrderAssigned
OrderPickedUp
OrderOutForDelivery
OrderDelivered
OrderCancelled
PaymentInitiated
PaymentSucceeded
PaymentFailed
RewardEarned
```

Suggested topics:

```text
spicyeat.user.events
spicyeat.order.events
spicyeat.payment.events
spicyeat.delivery.events
spicyeat.reward.events
```

Event envelope:

```json
{
  "eventId": "uuid",
  "eventType": "ORDER_DELIVERED",
  "occurredAt": "timestamp",
  "version": 1,
  "aggregateId": "order-id",
  "payload": {}
}
```

Events must be immutable, versionable, traceable, and safe for duplicate consumption.

---

# 17. Transactional Outbox

Important events should use an outbox pattern.

Problem:

```text
DB transaction succeeds
Kafka publish fails
```

Solution:

```text
Business transaction
      |
      v
DB transaction
+--------------------+
| business data      |
| outbox event       |
+--------------------+
      |
      v
Outbox publisher
      |
      v
Kafka
```

Use for important order, payment, delivery, and reward events.

---

# 18. Distributed Transactions

Do not use distributed database transactions across services.

Use:

- local transactions
- domain events
- Saga-style workflows
- compensating actions
- explicit state machines

Example:

```text
Create Order
   -> INITIATED
   -> Payment
   -> SUCCESS
   -> CONFIRMED
```

If payment fails:

```text
Payment FAILED
   -> Order PAYMENT_FAILED
   -> retry/cancel according to business rules
```

---

# 19. Redis

Use selectively for:

```text
menu caching
popular items
rate limiting
temporary state
distributed locks only where justified
```

Example:

```text
GET /api/menu
    |
    v
Redis
    |
cache miss
    v
Menu DB
    |
    v
Redis
```

Use TTL and explicit invalidation.

---

# 20. Concurrency

Intentionally solve:

### Delivery race

Two partners attempt to accept the same delivery.

### Checkout race

Two requests try to purchase limited availability.

### Cart race

Concurrent quantity updates.

Use where appropriate:

- optimistic locking
- pessimistic locking
- unique constraints
- atomic operations
- transactions
- appropriate isolation levels

---

# 21. Idempotency

Support idempotency for important operations:

```text
POST /orders
POST /payments
POST /rewards/redeem
```

Example:

```http
Idempotency-Key: UUID
```

Repeated requests with the same key must not duplicate the business operation.

---

# 22. Resilience

Use Resilience4j where appropriate:

```text
Timeout
Retry
Circuit Breaker
Bulkhead
Rate Limiter
```

Important rule:

Do not blindly retry non-idempotent operations.

Example:

```text
Order
  |
  v
Payment
  |
 timeout
  |
 retry safely
  |
 circuit breaker
```

---

# 23. Service Discovery

Do not introduce Eureka by default.

For the initial deployment, environment-based service URLs or platform networking are sufficient.

Evaluate Kubernetes-native service discovery later if the project moves to Kubernetes.

---

# 24. Configuration

Never hardcode:

- DB credentials
- JWT secrets
- payment secrets
- API keys
- Kafka credentials

Local:

```text
.env
Podman environment variables
```

Production:

```text
Railway environment variables/secrets
Supabase credentials
```

Use environment-specific configuration.

---

# 25. CORS

Development frontend:

```text
http://localhost:5192
```

Production frontend:

```text
https://spicyeat.vercel.app
```

Configure CORS at the gateway.

Do not use `*` for authenticated production traffic.

---

# 26. Error Handling

Standard error response:

```json
{
  "timestamp": "2026-08-25T12:00:00Z",
  "status": 400,
  "code": "INVALID_REQUEST",
  "message": "Quantity must be greater than zero",
  "path": "/api/cart/items",
  "traceId": "..."
}
```

Implement:

- global exception handlers
- validation errors
- domain exceptions
- 404 errors
- authentication errors
- authorization errors
- downstream service errors

Never expose stack traces.

---

# 27. API Standards

Use:

```text
/api/{resource}
```

HTTP methods:

```text
GET
POST
PUT/PATCH
DELETE
```

Status codes:

```text
200
201
204
400
401
403
404
409
422
429
500
503
```

Document APIs with OpenAPI/Swagger.

---

# 28. Security

Implement:

- Spring Security
- JWT
- role-based authorization
- password hashing
- input validation
- CORS
- rate limiting
- secure headers
- secret management
- safe logging

Authorization examples:

```text
CUSTOMER:
read menu
manage own cart
create own orders
view own orders

ADMIN:
manage menu
manage offers
manage rewards
manage orders
manage customers
manage delivery partners

DELIVERY_PARTNER:
view assigned deliveries
update assigned delivery status
view own earnings
```

Never allow ID-based access to another user's data.

---

# 29. Database Migrations

Use Flyway per service.

Example:

```text
auth-service/
  src/main/resources/db/migration/
    V1__create_credentials.sql
    V2__create_refresh_tokens.sql
```

Never manually modify production schema.

---

# 30. Testing Strategy

## Unit

- business logic
- validators
- state transitions

## Repository

- JPA mappings
- queries
- constraints

## Controller

- status codes
- validation
- authorization

## Integration

Use Testcontainers for:

```text
Spring Boot + PostgreSQL
```

## Contract

Verify service-to-service API contracts.

## Event

Test:

```text
publish
consume
duplicate event
consumer failure
```

## End-to-end

```text
Register
-> Login
-> Menu
-> Cart
-> Checkout
-> Payment
-> Order
-> Delivery
-> Delivered
-> Rewards
```

---

# 31. Observability

## Structured logging

Include:

```text
timestamp
service
level
traceId
requestId
userId when appropriate
message
```

Never log passwords or sensitive payment data.

## Metrics

Track:

```text
request count
latency
error rate
order throughput
payment failures
Kafka lag
database latency
cache hit ratio
```

## Distributed tracing

Use OpenTelemetry later.

Desired trace:

```text
Frontend
 -> Gateway
 -> Order Service
 -> Payment Service
 -> Kafka
 -> Notification Service
```

---

# 32. Podman Local Repository

```text
spicyeat-backend/
|
+-- api-gateway/
+-- auth-service/
+-- user-service/
+-- menu-service/
+-- cart-service/
+-- order-service/
+-- payment-service/
+-- delivery-service/
+-- offer-service/
+-- reward-service/
+-- notification-service/
|
+-- infrastructure/
|   +-- postgres/
|   +-- redis/
|   +-- kafka/
|
+-- podman-compose.yml
+-- README.md
```

Each service should contain its own:

```text
Containerfile
pom.xml
src/
```

Example:

```bash
podman build -t spicyeat-auth ./auth-service
podman run -p 8081:8080 spicyeat-auth
```

Use Podman Compose for the complete local environment.

---

# 33. Local Ports

```text
Frontend             5192

API Gateway           8080
Auth Service          8081
User Service          8082
Menu Service          8083
Cart Service          8084
Order Service         8085
Payment Service       8086
Delivery Service      8087
Offer Service         8088
Reward Service        8089
Notification Service  8090

PostgreSQL             5432
Redis                  6379
Kafka                  9092
```

The frontend should normally call only:

```text
http://localhost:8080
```

---

# 34. Production Deployment

Initial deployment:

```text
Vercel
   |
   v
Railway API Gateway
   |
   v
Railway microservices
   |
   +--> Supabase PostgreSQL
   +--> Redis
   +--> Kafka
```

Each microservice can eventually be a separate Railway service.

Alternative platform:

```text
Render
```

Keep images OCI-compatible so the architecture remains portable.

---

# 35. Supabase PostgreSQL

Use Supabase as managed PostgreSQL.

Logical schemas can initially be:

```text
auth
user
menu
cart
order
payment
delivery
offer
reward
```

The important architectural rule:

> Services own their data and must not directly query another service's tables.

---

# 36. CI/CD

Use GitHub Actions.

Backend pipeline:

```text
git push
   |
GitHub Actions
   |
compile
   |
unit tests
   |
integration tests
   |
build container image
   |
push to GHCR
   |
deploy Railway
```

Frontend:

```text
git push
   |
Vercel
   |
build
   |
deploy
```

---

# 37. Container Registry

Use GitHub Container Registry.

Example:

```text
ghcr.io/<org>/spicyeat-auth
ghcr.io/<org>/spicyeat-menu
ghcr.io/<org>/spicyeat-order
```

Never put secrets in image layers.

---

# 38. Frontend Integration

Current state:

```text
React
  |
Typed Mock API
  |
Mock data
```

Target:

```text
React
  |
Typed API Client
  |
API Gateway
  |
Microservice
  |
Database
```

Development:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Production:

```env
VITE_API_BASE_URL=https://api.spicyeat.com
```

Keep API contracts stable while replacing mock implementations.

---

# 39. Complete Customer Flow

```text
Register
 -> Login
 -> JWT
 -> Home
 -> Explore/Menu
 -> Menu Item
 -> Cart
 -> Checkout
 -> Offer validation
 -> Payment
 -> Order creation
 -> Order confirmed
 -> Preparing
 -> Delivery assignment
 -> Picked up
 -> Out for delivery
 -> Delivered
 -> Reward credited
 -> Notification
```

---

# 40. Admin Flow

```text
Admin Login
 -> Dashboard
    -> Orders
    -> Menu
    -> Categories
    -> Customers
    -> Delivery Partners
    -> Offers
    -> Rewards
    -> Analytics
    -> Settings
```

Admin capabilities:
- menu CRUD
- category management
- availability
- order management
- offers
- rewards
- customer management
- delivery partner management
- analytics

---

# 41. Delivery Partner Flow

```text
Login
 -> Dashboard
 -> Available Orders
 -> Accept
 -> Navigate to SpicyEat
 -> Pickup
 -> Navigate to Customer
 -> Delivered
 -> Earnings
```

---

# 42. System Design Learning Milestones

For every major feature, document:

1. Why does this service exist?
2. What data does it own?
3. Why is that data not directly shared?
4. Why is communication synchronous or asynchronous?
5. What happens if the dependency fails?
6. How do we retry?
7. How do we prevent duplicates?
8. How do we maintain consistency?
9. How do we scale the service?
10. What is the bottleneck?
11. What is cached?
12. What happens during partial failure?

This project should teach actual system design, not just CRUD.

---

# 43. Failure Scenarios

Implement or explicitly design for:

### Payment service unavailable

```text
Order -> Payment
       -> timeout
       -> safe retry
       -> circuit breaker
```

### Payment succeeds but response is lost

Use:

- provider verification
- idempotency
- reconciliation

### Kafka duplicate event

Consumers must be idempotent using event IDs/processed-event records.

### Delivery assignment race

Use appropriate locking, optimistic concurrency, and unique constraints.

### Menu price changes during checkout

Revalidate server-side and create pricing snapshots.

### Double-click Place Order

Use idempotency keys.

### Service unavailable during order creation

Use explicit state and recovery/retry mechanisms.

### Redis unavailable

Degrade gracefully to the database where safe.

---

# 44. Development Order

## Phase 0 — Architecture

- service boundaries
- API contracts
- database ownership
- event model
- repository structure

## Phase 1 — Foundation

- Spring Boot services
- gateway
- PostgreSQL
- Flyway
- Podman
- configuration
- error handling
- logging

## Phase 2 — Authentication

- Auth Service
- JWT
- refresh tokens
- roles
- security
- User Service
- register/login/profile

## Phase 3 — Menu

- categories
- menu items
- images
- spice levels
- availability
- search
- admin CRUD

## Phase 4 — Cart

- cart
- cart items
- customizations
- price validation

## Phase 5 — Orders

- order creation
- pricing snapshot
- state machine
- history
- cancellation

## Phase 6 — Payment

- payment service
- idempotency
- provider integration
- verification
- refunds

## Phase 7 — Delivery

- delivery partner
- assignment
- status
- tracking
- earnings

## Phase 8 — Offers & Rewards

- coupons
- offers
- Spicy Coins
- redemption

## Phase 9 — Kafka

- domain events
- consumers
- transactional outbox
- idempotent consumers

## Phase 10 — Redis & Resilience

- caching
- rate limiting
- circuit breakers
- retries
- distributed locking where justified

## Phase 11 — Observability

- metrics
- tracing
- structured logs
- dashboards

## Phase 12 — Production

- container images
- GitHub Actions
- GHCR
- Railway
- Supabase
- Vercel ↔ Gateway
- production CORS
- secrets
- domain

---

# 45. Definition of Done

The backend is ready when:

- service boundaries are documented
- each service owns its data
- API Gateway is the public entry point
- authentication works
- JWT authorization works
- all three roles work
- menu is database-backed
- cart works
- orders work
- payment is resilient
- delivery works
- offers work
- rewards work
- notifications work
- Kafka events work
- important events use an outbox
- consumers are idempotent
- important operations support idempotency
- Redis is used selectively
- resilience policies exist
- APIs are documented
- unit/integration tests exist
- Podman local stack works
- CI/CD works
- production containers deploy
- Vercel communicates through the gateway
- production CORS is correct
- secrets are protected
- observability exists
- failure scenarios have been tested

---

# 46. Non-Negotiable Rules

1. No restaurant marketplace.
2. No restaurant service.
3. No beverages.
4. No Chinese category.
5. Do not create microservices merely for the sake of having more services.
6. Do not share databases directly between services.
7. Do not put business logic in the API Gateway.
8. Do not expose internal services unnecessarily.
9. Never trust frontend prices/totals.
10. Never store plaintext passwords.
11. Never hardcode secrets.
12. Do not use wildcard CORS for authenticated production traffic.
13. Do not blindly retry non-idempotent operations.
14. Do not assume client payment requests mean payment success.
15. Do not use distributed database transactions.
16. Do not introduce Kafka everywhere.
17. Do not introduce Redis everywhere.
18. Every important distributed operation needs a failure strategy.
19. Every important asynchronous consumer must be idempotent.
20. Prefer understandable architecture over unnecessary complexity.

---

# 47. North Star

The final system should look like:

```text
React
  |
Vercel
  |
API Gateway
  |
Spring Boot Microservices
  |
PostgreSQL / Redis
  |
Kafka
  |
External payment/notification systems
```

The goal is not merely:

> "Make the food ordering website work."

The goal is:

> **Build a realistic, resilient, observable, containerized Java microservices system that is understandable enough to explain in a system-design interview.**

Every architectural decision should have a reason.
Every service should have clear ownership.
Every distributed interaction should have a failure strategy.
Every major implementation should teach a system-design concept.
