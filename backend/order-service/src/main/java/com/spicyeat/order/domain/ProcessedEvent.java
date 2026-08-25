package com.spicyeat.order.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/** Dedup ledger for Kafka consumption: a redelivered event with the same eventId is a no-op. */
@Entity
@Table(name = "processed_events")
public class ProcessedEvent {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "event_id", nullable = false, unique = true)
    private String eventId;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt = Instant.now();

    protected ProcessedEvent() {
    }

    public ProcessedEvent(String eventId) {
        this.eventId = eventId;
    }

    public String getEventId() {
        return eventId;
    }
}
