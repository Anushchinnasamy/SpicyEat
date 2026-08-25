package com.spicyeat.cart.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cart_item_addons")
public class CartItemAddon {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "cart_item_id", nullable = false)
    private UUID cartItemId;

    @Column(name = "addon_id", nullable = false)
    private UUID addonId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    protected CartItemAddon() {
    }

    public CartItemAddon(UUID cartItemId, UUID addonId, String name, BigDecimal price) {
        this.cartItemId = cartItemId;
        this.addonId = addonId;
        this.name = name;
        this.price = price;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCartItemId() {
        return cartItemId;
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
