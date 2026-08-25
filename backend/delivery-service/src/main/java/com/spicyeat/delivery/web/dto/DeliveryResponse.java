package com.spicyeat.delivery.web.dto;

import com.spicyeat.delivery.domain.Delivery;

import java.time.Instant;
import java.util.UUID;

public record DeliveryResponse(
        UUID id,
        UUID orderId,
        String status,
        UUID partnerId,
        Instant assignedAt,
        Instant pickedUpAt,
        Instant deliveredAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static DeliveryResponse from(Delivery delivery) {
        return new DeliveryResponse(
                delivery.getId(), delivery.getOrderId(), delivery.getStatus().name(), delivery.getPartnerId(),
                delivery.getAssignedAt(), delivery.getPickedUpAt(), delivery.getDeliveredAt(),
                delivery.getCreatedAt(), delivery.getUpdatedAt()
        );
    }
}
