package com.spicyeat.cart.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MenuItemView(
        UUID id,
        UUID categoryId,
        String name,
        String slug,
        String description,
        BigDecimal price,
        String spiceLevel,
        boolean vegetarian,
        boolean available,
        boolean featured,
        String imageUrl,
        int displayOrder
) {
}
