CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE notification_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type                VARCHAR(30) NOT NULL,
    user_id             UUID NOT NULL,
    recipient_email     VARCHAR(255) NOT NULL,
    subject             VARCHAR(255) NOT NULL,
    status              VARCHAR(20) NOT NULL,
    provider_message_id VARCHAR(255),
    failure_reason      VARCHAR(1000),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_log_user_id ON notification_log (user_id);
