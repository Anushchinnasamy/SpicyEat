CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE orders (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL,
    status               VARCHAR(30) NOT NULL,
    address_label        VARCHAR(60) NOT NULL,
    address_line1        VARCHAR(255) NOT NULL,
    address_line2        VARCHAR(255),
    address_city         VARCHAR(120) NOT NULL,
    address_state        VARCHAR(120) NOT NULL,
    address_postal_code  VARCHAR(20) NOT NULL,
    subtotal             NUMERIC(10, 2) NOT NULL,
    discount             NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee         NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax                  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total                NUMERIC(10, 2) NOT NULL,
    cancel_reason        VARCHAR(500),
    version              BIGINT NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
