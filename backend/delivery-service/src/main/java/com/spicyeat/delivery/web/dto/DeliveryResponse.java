package com.spicyeat.delivery.web.dto;

import com.spicyeat.delivery.client.OrderSummary;
import com.spicyeat.delivery.domain.Delivery;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
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
        Instant updatedAt,
        OrderSummary.AddressSummary deliveryAddress,
        List<OrderSummary.ItemSummary> items,
        BigDecimal orderTotal
) {
    public static DeliveryResponse from(Delivery delivery) {
        return from(delivery, null);
    }

    public static DeliveryResponse from(Delivery delivery, OrderSummary order) {
        return new DeliveryResponse(
                delivery.getId(), delivery.getOrderId(), delivery.getStatus().name(), delivery.getPartnerId(),
                delivery.getAssignedAt(), delivery.getPickedUpAt(), delivery.getDeliveredAt(),
                delivery.getCreatedAt(), delivery.getUpdatedAt(),
                order != null ? order.deliveryAddress() : null,
                order != null ? order.items() : null,
                order != null ? order.total() : null
        );
    }
}
