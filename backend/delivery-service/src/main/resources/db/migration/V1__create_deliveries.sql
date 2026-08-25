CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE deliveries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL UNIQUE,
    status       VARCHAR(30) NOT NULL,
    partner_id   UUID,
    assigned_at  TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    version      BIGINT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deliveries_status ON deliveries (status);
CREATE INDEX idx_deliveries_partner_id ON deliveries (partner_id);
