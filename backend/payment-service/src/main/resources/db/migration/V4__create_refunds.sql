CREATE TABLE refunds (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
    amount     NUMERIC(10, 2) NOT NULL,
    reason     VARCHAR(500),
    status     VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refunds_payment_id ON refunds (payment_id);
