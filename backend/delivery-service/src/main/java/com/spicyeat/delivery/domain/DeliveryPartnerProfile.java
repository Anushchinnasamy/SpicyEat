package com.spicyeat.delivery.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delivery_partner_profiles")
public class DeliveryPartnerProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    private String vehicle;

    /** Null until the platform has a real way to produce one — never fabricated. */
    private BigDecimal rating;

    @Column(nullable = false)
    private boolean online = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected DeliveryPartnerProfile() {
    }

    public DeliveryPartnerProfile(UUID userId) {
        this.userId = userId;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getUserId() {
        return userId;
    }

    public String getVehicle() {
        return vehicle;
    }

    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
