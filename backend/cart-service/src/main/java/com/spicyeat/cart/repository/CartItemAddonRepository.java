package com.spicyeat.cart.repository;

import com.spicyeat.cart.domain.CartItemAddon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CartItemAddonRepository extends JpaRepository<CartItemAddon, UUID> {
    List<CartItemAddon> findByCartItemId(UUID cartItemId);
    List<CartItemAddon> findByCartItemIdIn(List<UUID> cartItemIds);
    void deleteByCartItemId(UUID cartItemId);
}
