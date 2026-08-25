package com.spicyeat.menu.web.dto;

import com.spicyeat.menu.domain.Addon;

import java.math.BigDecimal;
import java.util.UUID;

public record AddonResponse(UUID id, String name, BigDecimal price) {
    public static AddonResponse from(Addon addon) {
        return new AddonResponse(addon.getId(), addon.getName(), addon.getPrice());
    }
}
