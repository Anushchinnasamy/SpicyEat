CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(30) NOT NULL UNIQUE,
    name          VARCHAR(60) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

INSERT INTO categories (code, name, display_order) VALUES
    ('BURGERS', 'Burgers', 1),
    ('FRIED_CHICKEN', 'Fried Chicken', 2),
    ('PIZZA', 'Pizza', 3),
    ('WRAPS_ROLLS', 'Wraps & Rolls', 4),
    ('LOADED', 'Loaded', 5),
    ('PASTA', 'Pasta', 6),
    ('SIDES', 'Sides', 7),
    ('DESSERTS', 'Desserts', 8);
