package com.spicyeat.delivery.web.dto;

import com.spicyeat.delivery.domain.Earning;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record EarningResponse(UUID id, UUID deliveryId, BigDecimal amount, Instant createdAt) {
    public static EarningResponse from(Earning earning) {
        return new EarningResponse(earning.getId(), earning.getDeliveryId(), earning.getAmount(), earning.getCreatedAt());
    }
}
