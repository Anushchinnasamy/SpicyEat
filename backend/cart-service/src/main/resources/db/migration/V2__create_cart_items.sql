CREATE TABLE cart_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id      UUID NOT NULL REFERENCES carts (user_id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL,
    item_name    VARCHAR(150) NOT NULL,
    unit_price   NUMERIC(10, 2) NOT NULL,
    quantity     INT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
