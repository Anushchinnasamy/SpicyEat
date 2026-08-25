CREATE TABLE earnings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id  UUID NOT NULL,
    delivery_id UUID NOT NULL UNIQUE REFERENCES deliveries (id) ON DELETE CASCADE,
    amount      NUMERIC(10, 2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_earnings_partner_id ON earnings (partner_id);
