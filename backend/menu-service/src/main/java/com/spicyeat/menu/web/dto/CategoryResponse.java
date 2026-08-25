package com.spicyeat.menu.web.dto;

import com.spicyeat.menu.domain.Category;

import java.util.UUID;

public record CategoryResponse(UUID id, String code, String name, int displayOrder) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId(), category.getCode().name(), category.getName(), category.getDisplayOrder());
    }
}
