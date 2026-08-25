CREATE TABLE order_item_addons (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items (id) ON DELETE CASCADE,
    addon_id      UUID NOT NULL,
    name          VARCHAR(120) NOT NULL,
    price         NUMERIC(10, 2) NOT NULL
);

CREATE INDEX idx_order_item_addons_order_item_id ON order_item_addons (order_item_id);
