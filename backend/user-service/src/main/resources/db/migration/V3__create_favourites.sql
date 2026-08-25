CREATE TABLE favourites (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    menu_item_id UUID NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_favourites_user_menu_item UNIQUE (user_id, menu_item_id)
);

CREATE INDEX idx_favourites_user_id ON favourites (user_id);
