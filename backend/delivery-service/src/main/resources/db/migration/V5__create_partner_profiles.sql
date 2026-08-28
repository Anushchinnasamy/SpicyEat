CREATE TABLE delivery_partner_profiles (
    user_id    UUID PRIMARY KEY,
    vehicle    VARCHAR(200),
    rating     NUMERIC(2, 1),
    online     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
