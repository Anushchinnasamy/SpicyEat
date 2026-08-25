package com.spicyeat.cart.web.dto;

import com.spicyeat.cart.domain.CartItemAddon;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemAddonResponse(UUID id, UUID addonId, String name, BigDecimal price) {
    public static CartItemAddonResponse from(CartItemAddon addon) {
        return new CartItemAddonResponse(addon.getId(), addon.getAddonId(), addon.getName(), addon.getPrice());
    }
}
