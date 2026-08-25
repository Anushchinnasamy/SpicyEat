CREATE TABLE cart_item_addons (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_item_id UUID NOT NULL REFERENCES cart_items (id) ON DELETE CASCADE,
    addon_id     UUID NOT NULL,
    name         VARCHAR(120) NOT NULL,
    price        NUMERIC(10, 2) NOT NULL
);

CREATE INDEX idx_cart_item_addons_cart_item_id ON cart_item_addons (cart_item_id);
