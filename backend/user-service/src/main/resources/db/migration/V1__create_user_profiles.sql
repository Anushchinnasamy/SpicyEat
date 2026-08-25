CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE user_profiles (
    user_id      UUID PRIMARY KEY,
    full_name    VARCHAR(120),
    phone_number VARCHAR(20),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
