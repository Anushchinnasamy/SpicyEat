# Deploying SpicyEat — Render (backend) + Vercel (frontend)

Kafka is intentionally not deployed (see `render.yaml` comments) — order/payment
emails, auto order-status-advance, and auto delivery-creation won't fire in
production until a managed Kafka provider is wired in later. Everything else
works.

Do this in order — the backend needs to exist before the frontend can point
at it, and the gateway's CORS needs the frontend's final URL.

## 0. Prerequisites

- This repo pushed to GitHub (Render/Vercel both deploy from a connected repo).
- A [Render](https://render.com) account and a [Vercel](https://vercel.com) account.
- Your Stripe **test** keys and Resend API key (same ones from `backend/.env.local` locally).

## 1. Render: managed Postgres

Render → **New → PostgreSQL**. Free tier note: Render's free Postgres is
deleted after 30 days of inactivity-free use unless upgraded to a paid plan —
fine for testing, not for anything you want to keep.

Once it's up, open its **Connect** tab and copy the **External Database URL**
(`postgresql://user:pass@host/dbname`). Use its `psql` command (also shown on
that tab) to create the 8 databases this app needs — same as
`backend/infrastructure/postgres/init-databases.sh` does locally:

```sql
CREATE DATABASE spicyeat_auth;
CREATE DATABASE spicyeat_user;
CREATE DATABASE spicyeat_menu;
CREATE DATABASE spicyeat_cart;
CREATE DATABASE spicyeat_order;
CREATE DATABASE spicyeat_payment;
CREATE DATABASE spicyeat_delivery;
CREATE DATABASE spicyeat_notification;
```

Each service's `DB_URL` (below) is the same host/user/password from that
External Database URL, with the database name swapped for its own, e.g.:

```
jdbc:postgresql://<host>/spicyeat_auth
```

(Note the `jdbc:` prefix — Render gives you a plain `postgresql://` URL, the
services need the JDBC form.)

## 2. Render: managed Redis (Key Value)

Render → **New → Key Value**. Copy its host, port, and password from the
Connect tab. Render's Redis requires TLS, which is why `REDIS_SSL: "true"` is
already set in `render.yaml`.

## 3. Render: deploy the backend Blueprint

Render → **New → Blueprint** → connect this repo → it detects `render.yaml`
and lists all 9 services with their `sync: false` env vars for you to fill in.

Fill in per service (values from steps 1–2 above, plus your own secrets):

| Service | Vars to fill |
|---|---|
| api-gateway | `JWT_SECRET` (generate one, e.g. `openssl rand -base64 32`), `CORS_ALLOWED_ORIGINS` (temporarily `http://localhost:5192` — you'll update this in step 6), `REDIS_HOST`, `REDIS_USERNAME` (blank/default), `REDIS_PASSWORD` |
| auth-service | `DB_URL/USERNAME/PASSWORD`, `JWT_SECRET` (**same value as api-gateway**), `FRONTEND_RESET_PASSWORD_URL` (temporarily `http://localhost:5192/reset-password` — update in step 6) |
| user-service | `DB_URL/USERNAME/PASSWORD` |
| menu-service | `DB_URL/USERNAME/PASSWORD`, `REDIS_HOST`, `REDIS_USERNAME`, `REDIS_PASSWORD` |
| cart-service | `DB_URL/USERNAME/PASSWORD` |
| order-service | `DB_URL/USERNAME/PASSWORD` |
| payment-service | `DB_URL/USERNAME/PASSWORD`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (see step 5) |
| delivery-service | `DB_URL/USERNAME/PASSWORD` |
| notification-service | `DB_URL/USERNAME/PASSWORD`, `RESEND_API_KEY` |

Click **Apply**. All 9 services build and deploy. Free-tier services spin
down after 15 minutes idle and take 30–60s to wake on the next request —
expect a slow first request after any idle period.

Once deployed, note **api-gateway's public URL**
(`https://api-gateway-xxxx.onrender.com`) — the frontend needs it next.

## 4. Resend: production sending domain

`onboarding@resend.dev` (the local-dev default) only delivers to your own
Resend account email — that's a sandbox restriction, not a bug. For real
users to receive emails in production, verify a real sending domain in the
Resend dashboard and set `RESEND_FROM_ADDRESS` to an address on it (e.g.
`SpicyEat <noreply@yourdomain.com>`).

## 5. Stripe: production webhook

Locally, payment confirmation uses a polling fallback (`verifyPayment`)
because there's no public URL for Stripe to call back to. In production, set
up the real webhook instead:

Stripe Dashboard → **Developers → Webhooks → Add endpoint** → URL:
`https://payment-service-xxxx.onrender.com/api/payments/webhook` → events:
`payment_intent.succeeded`, `payment_intent.payment_failed`,
`payment_intent.canceled`. Copy the generated signing secret into
payment-service's `STRIPE_WEBHOOK_SECRET` on Render.

## 6. Vercel: deploy the frontend

Vercel → **New Project** → import this repo → **Root Directory: `frontend`**
(framework preset auto-detects Vite). Set env vars:

- `VITE_API_BASE_URL` = the api-gateway URL from step 3
- `VITE_STRIPE_PUBLISHABLE_KEY` = your Stripe test publishable key

Deploy. Note the resulting Vercel URL (`https://your-app.vercel.app`).

## 7. Close the loop: point the backend at the real frontend URL

Back on Render, update and redeploy:

- **api-gateway** → `CORS_ALLOWED_ORIGINS` = your Vercel URL
- **auth-service** → `FRONTEND_RESET_PASSWORD_URL` = `https://your-app.vercel.app/reset-password`

## 8. Smoke test

Register a real account, browse the menu, add to cart, check out with a
Stripe test card (`4242 4242 4242 4242`), and check `/admin/login` +
`/delivery/login` both reject non-matching roles. Everything should work
except the Kafka-dependent pieces noted at the top.
