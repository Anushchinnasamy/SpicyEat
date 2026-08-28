package com.spicyeat.delivery.client;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Slim projection of order-service's OrderResponse — only what a delivery partner needs to see. */
public record OrderSummary(UUID id, AddressSummary deliveryAddress, List<ItemSummary> items, BigDecimal total) {

    public record AddressSummary(String label, String line1, String line2, String city, String state, String postalCode) {
    }

    public record ItemSummary(String itemName, int quantity, BigDecimal unitPrice) {
    }
}
