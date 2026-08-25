package com.spicyeat.payment.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/** Dedup ledger so a redelivered provider webhook never gets applied twice. */
@Entity
@Table(name = "processed_webhook_events")
public class ProcessedWebhookEvent {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "event_id", nullable = false, unique = true)
    private String eventId;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();

    protected ProcessedWebhookEvent() {
    }

    public ProcessedWebhookEvent(String eventId) {
        this.eventId = eventId;
    }

    public UUID getId() {
        return id;
    }

    public String getEventId() {
        return eventId;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }
}
