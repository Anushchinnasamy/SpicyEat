package com.spicyeat.menu.web.dto;

import com.spicyeat.menu.domain.SpiceLevel;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record MenuItemRequest(
        @NotNull UUID categoryId,
        @NotBlank String name,
        @NotBlank String slug,
        String description,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
        @NotNull SpiceLevel spiceLevel,
        boolean vegetarian,
        String imageUrl,
        int displayOrder
) {
}
