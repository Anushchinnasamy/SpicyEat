package com.spicyeat.order.repository;

import com.spicyeat.order.domain.OrderItemAddon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderItemAddonRepository extends JpaRepository<OrderItemAddon, UUID> {
    List<OrderItemAddon> findByOrderItemIdIn(List<UUID> orderItemIds);
}
