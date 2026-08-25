package com.spicyeat.order.web;

import com.spicyeat.common.security.CurrentUser;
import com.spicyeat.common.security.Role;
import com.spicyeat.order.domain.Order;
import com.spicyeat.order.domain.OrderItem;
import com.spicyeat.order.domain.OrderItemAddon;
import com.spicyeat.order.service.OrderService;
import com.spicyeat.order.web.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> checkout(HttpServletRequest request, @Valid @RequestBody CreateOrderRequest body) {
        UUID userId = CurrentUser.userId(request);
        Order order = orderService.checkout(userId, body.addressId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(order));
    }

    @GetMapping
    public List<OrderResponse> listOrders(HttpServletRequest request) {
        UUID userId = CurrentUser.userId(request);
        return orderService.listOrders(userId).stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(HttpServletRequest request, @PathVariable UUID id) {
        UUID userId = CurrentUser.userId(request);
        return toResponse(orderService.getOrder(userId, id));
    }

    @PostMapping("/{id}/cancel")
    public OrderResponse cancel(HttpServletRequest request, @PathVariable UUID id, @RequestBody(required = false) CancelOrderRequest body) {
        UUID userId = CurrentUser.userId(request);
        String reason = body == null ? null : body.reason();
        return toResponse(orderService.cancel(userId, id, reason));
    }

    @GetMapping("/{id}/timeline")
    public List<OrderStatusHistoryResponse> timeline(HttpServletRequest request, @PathVariable UUID id) {
        UUID userId = CurrentUser.userId(request);
        return orderService.getTimeline(userId, id).stream().map(OrderStatusHistoryResponse::from).toList();
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<OrderResponse> reorder(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody CreateOrderRequest body) {
        UUID userId = CurrentUser.userId(request);
        Order order = orderService.reorder(userId, id, body.addressId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(order));
    }

    @PostMapping("/{id}/status")
    public OrderResponse updateStatus(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody UpdateStatusRequest body) {
        CurrentUser.requireRole(request, Role.ADMIN);
        return toResponse(orderService.advanceStatus(id, body.status()));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItem> items = orderService.getOrderItems(order.getId());
        Map<UUID, List<OrderItemAddon>> addonsByItem = orderService.getAddonsByItem(items.stream().map(OrderItem::getId).toList());

        List<OrderItemResponse> itemResponses = items.stream()
                .map(item -> new OrderItemResponse(
                        item.getId(), item.getMenuItemId(), item.getItemName(), item.getUnitPrice(), item.getQuantity(),
                        item.getLineTotal(),
                        addonsByItem.getOrDefault(item.getId(), List.of()).stream().map(OrderItemAddonResponse::from).toList()
                ))
                .toList();

        return new OrderResponse(
                order.getId(), order.getUserId(), order.getStatus().name(),
                AddressSnapshotResponse.from(order.getDeliveryAddress()), itemResponses,
                order.getSubtotal(), order.getDiscount(), order.getDeliveryFee(), order.getTax(), order.getTotal(),
                order.getCancelReason(), order.getCreatedAt(), order.getUpdatedAt()
        );
    }
}
