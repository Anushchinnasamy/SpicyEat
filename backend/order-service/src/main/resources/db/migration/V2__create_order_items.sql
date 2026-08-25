CREATE TABLE order_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL,
    item_name    VARCHAR(150) NOT NULL,
    unit_price   NUMERIC(10, 2) NOT NULL,
    quantity     INT NOT NULL,
    line_total   NUMERIC(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
