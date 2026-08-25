package com.spicyeat.cart.web.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(UUID userId, List<CartItemResponse> items, BigDecimal subtotal) {
}
