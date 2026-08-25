package com.spicyeat.cart.web.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartItemResponse(
        UUID id,
        UUID menuItemId,
        String itemName,
        BigDecimal unitPrice,
        int quantity,
        List<CartItemAddonResponse> addons,
        BigDecimal lineTotal
) {
}
