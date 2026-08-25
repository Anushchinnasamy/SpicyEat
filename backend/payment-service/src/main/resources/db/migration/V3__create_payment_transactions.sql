CREATE TABLE payment_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id          UUID NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
    type                VARCHAR(20) NOT NULL,
    amount              NUMERIC(10, 2) NOT NULL,
    status              VARCHAR(30) NOT NULL,
    provider_reference  VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_transactions_payment_id ON payment_transactions (payment_id);
