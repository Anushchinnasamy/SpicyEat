package com.spicyeat.order.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MenuItemView(UUID id, String name, BigDecimal price, boolean available) {
}
