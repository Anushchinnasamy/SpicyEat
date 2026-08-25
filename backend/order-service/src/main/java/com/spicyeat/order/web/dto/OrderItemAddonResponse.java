package com.spicyeat.order.web.dto;

import com.spicyeat.order.domain.OrderItemAddon;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemAddonResponse(UUID id, UUID addonId, String name, BigDecimal price) {
    public static OrderItemAddonResponse from(OrderItemAddon addon) {
        return new OrderItemAddonResponse(addon.getId(), addon.getAddonId(), addon.getName(), addon.getPrice());
    }
}
