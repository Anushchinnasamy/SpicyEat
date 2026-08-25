CREATE TABLE delivery_status_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries (id) ON DELETE CASCADE,
    status      VARCHAR(30) NOT NULL,
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_status_history_delivery_id ON delivery_status_history (delivery_id);
