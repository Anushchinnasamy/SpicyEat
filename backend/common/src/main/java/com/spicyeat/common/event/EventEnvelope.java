package com.spicyeat.common.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Wire format for every Kafka event in the system (plan section 16).
 * Producers serialize this whole record as the message value; consumers
 * deserialize it generically, then re-parse {@code payload} into whatever
 * type they expect for that eventType.
 */
public record EventEnvelope(
        String eventId,
        String eventType,
        Instant occurredAt,
        int version,
        String aggregateId,
        Object payload
) {
    public static EventEnvelope of(String eventType, String aggregateId, Object payload) {
        return new EventEnvelope(UUID.randomUUID().toString(), eventType, Instant.now(), 1, aggregateId, payload);
    }
}
