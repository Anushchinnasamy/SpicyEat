package com.spicyeat.delivery.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delivery_status_history")
public class DeliveryStatusHistory {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "delivery_id", nullable = false)
    private UUID deliveryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt = Instant.now();

    protected DeliveryStatusHistory() {
    }

    public DeliveryStatusHistory(UUID deliveryId, DeliveryStatus status) {
        this.deliveryId = deliveryId;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public UUID getDeliveryId() {
        return deliveryId;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public Instant getChangedAt() {
        return changedAt;
    }
}
