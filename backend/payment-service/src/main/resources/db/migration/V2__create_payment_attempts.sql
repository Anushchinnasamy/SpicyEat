CREATE TABLE payment_attempts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id          UUID NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
    attempt_number      INT NOT NULL,
    status              VARCHAR(30) NOT NULL,
    provider_reference  VARCHAR(255),
    failure_reason      VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_attempts_payment_id ON payment_attempts (payment_id);
