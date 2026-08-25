CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE payments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID NOT NULL,
    user_id           UUID NOT NULL,
    amount            NUMERIC(10, 2) NOT NULL,
    status            VARCHAR(30) NOT NULL,
    idempotency_key   VARCHAR(255) NOT NULL,
    provider_reference VARCHAR(255),
    refunded_amount   NUMERIC(10, 2) NOT NULL DEFAULT 0,
    version           BIGINT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_payments_user_idempotency UNIQUE (user_id, idempotency_key)
);

CREATE INDEX idx_payments_order_id ON payments (order_id);
CREATE INDEX idx_payments_user_id ON payments (user_id);
