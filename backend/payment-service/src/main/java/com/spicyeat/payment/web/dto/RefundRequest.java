package com.spicyeat.payment.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RefundRequest(
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amount,
        String reason
) {
}
