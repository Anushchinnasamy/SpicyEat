package com.spicyeat.delivery.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateDeliveryRequest(@NotNull UUID orderId) {
}
