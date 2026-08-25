package com.spicyeat.payment.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** Shape of a (simulated) provider webhook callback confirming a charge outcome. */
public record WebhookRequest(
        @NotBlank String eventId,
        @NotNull UUID paymentId,
        @NotBlank String status,
        String providerReference
) {
}
