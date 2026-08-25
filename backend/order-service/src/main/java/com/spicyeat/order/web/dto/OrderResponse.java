package com.spicyeat.order.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID userId,
        String status,
        AddressSnapshotResponse deliveryAddress,
        List<OrderItemResponse> items,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal deliveryFee,
        BigDecimal tax,
        BigDecimal total,
        String cancelReason,
        Instant createdAt,
        Instant updatedAt
) {
}
