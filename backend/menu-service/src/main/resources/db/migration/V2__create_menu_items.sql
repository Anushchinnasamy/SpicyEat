CREATE TABLE menu_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id   UUID NOT NULL REFERENCES categories (id),
    name          VARCHAR(150) NOT NULL,
    slug          VARCHAR(160) NOT NULL UNIQUE,
    description   VARCHAR(1000),
    price         NUMERIC(10, 2) NOT NULL,
    spice_level   VARCHAR(20) NOT NULL,
    vegetarian    BOOLEAN NOT NULL DEFAULT false,
    available     BOOLEAN NOT NULL DEFAULT true,
    featured      BOOLEAN NOT NULL DEFAULT false,
    image_url     VARCHAR(500),
    display_order INT NOT NULL DEFAULT 0,
    version       BIGINT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_category_id ON menu_items (category_id);
CREATE INDEX idx_menu_items_available ON menu_items (available);
