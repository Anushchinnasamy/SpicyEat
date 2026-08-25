package com.spicyeat.menu.web.dto;

import com.spicyeat.menu.domain.MenuItem;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MenuItemResponse(
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
        int displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
    public static MenuItemResponse from(MenuItem item) {
        return new MenuItemResponse(
                item.getId(), item.getCategoryId(), item.getName(), item.getSlug(), item.getDescription(),
                item.getPrice(), item.getSpiceLevel().name(), item.isVegetarian(), item.isAvailable(),
                item.isFeatured(), item.getImageUrl(), item.getDisplayOrder(), item.getCreatedAt(), item.getUpdatedAt()
        );
    }
}
