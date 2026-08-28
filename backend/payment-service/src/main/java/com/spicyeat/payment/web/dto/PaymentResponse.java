package com.spicyeat.payment.web.dto;

import com.spicyeat.payment.domain.Payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID orderId,
        UUID userId,
        BigDecimal amount,
        String status,
        BigDecimal refundedAmount,
        String providerReference,
        String clientSecret,
        Instant createdAt,
        Instant updatedAt
) {
    public static PaymentResponse from(Payment payment) {
        return from(payment, null);
    }

    public static PaymentResponse from(Payment payment, String clientSecret) {
        return new PaymentResponse(
                payment.getId(), payment.getOrderId(), payment.getUserId(), payment.getAmount(),
                payment.getStatus().name(), payment.getRefundedAmount(), payment.getProviderReference(), clientSecret,
                payment.getCreatedAt(), payment.getUpdatedAt()
        );
    }
}
