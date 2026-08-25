package com.spicyeat.order.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_item_addons")
public class OrderItemAddon {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "order_item_id", nullable = false)
    private UUID orderItemId;

    @Column(name = "addon_id", nullable = false)
    private UUID addonId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    protected OrderItemAddon() {
    }

    public OrderItemAddon(UUID orderItemId, UUID addonId, String name, BigDecimal price) {
        this.orderItemId = orderItemId;
        this.addonId = addonId;
        this.name = name;
        this.price = price;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOrderItemId() {
        return orderItemId;
    }

    public UUID getAddonId() {
        return addonId;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }
}
