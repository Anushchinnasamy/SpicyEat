CREATE TABLE addons (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items (id) ON DELETE CASCADE,
    name         VARCHAR(120) NOT NULL,
    price        NUMERIC(10, 2) NOT NULL
);

CREATE INDEX idx_addons_menu_item_id ON addons (menu_item_id);
