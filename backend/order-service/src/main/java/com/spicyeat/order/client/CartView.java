package com.spicyeat.order.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CartView(UUID userId, List<CartItemView> items, BigDecimal subtotal) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CartItemView(
            UUID id,
            UUID menuItemId,
            String itemName,
            BigDecimal unitPrice,
            int quantity,
            List<CartItemAddonView> addons,
            BigDecimal lineTotal
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CartItemAddonView(UUID id, UUID addonId, String name, BigDecimal price) {
    }
}
