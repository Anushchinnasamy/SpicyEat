package com.spicyeat.cart.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record AddToCartRequest(
        @NotNull UUID menuItemId,
        @Min(1) int quantity,
        List<UUID> addonIds
) {
}
