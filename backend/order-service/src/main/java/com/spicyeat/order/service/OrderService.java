package com.spicyeat.order.service;

import com.spicyeat.common.error.ApiException;
import com.spicyeat.order.client.*;
import com.spicyeat.order.domain.*;
import com.spicyeat.order.outbox.OutboxRecorder;
import com.spicyeat.order.repository.OrderItemAddonRepository;
import com.spicyeat.order.repository.OrderItemRepository;
import com.spicyeat.order.repository.OrderRepository;
import com.spicyeat.order.repository.OrderStatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemAddonRepository orderItemAddonRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final CartServiceClient cartServiceClient;
    private final ResilientDependencyClient resilientDependencyClient;
    private final OutboxRecorder outboxRecorder;
    private final PaymentServiceClient paymentServiceClient;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OrderService.class);

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            OrderItemAddonRepository orderItemAddonRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            CartServiceClient cartServiceClient,
            ResilientDependencyClient resilientDependencyClient,
            OutboxRecorder outboxRecorder,
            PaymentServiceClient paymentServiceClient
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderItemAddonRepository = orderItemAddonRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.cartServiceClient = cartServiceClient;
        this.resilientDependencyClient = resilientDependencyClient;
        this.outboxRecorder = outboxRecorder;
        this.paymentServiceClient = paymentServiceClient;
    }

    @Transactional
    public Order checkout(UUID userId, UUID addressId) {
        CartView cart = cartServiceClient.getCart();
        if (cart.items() == null || cart.items().isEmpty()) {
            throw ApiException.badRequest("Cart is empty");
        }

        List<LineItem> lines = cart.items().stream()
                .map(item -> new LineItem(
                        item.menuItemId(), item.quantity(),
                        item.addons() == null ? List.of() : item.addons().stream().map(CartView.CartItemAddonView::addonId).toList()
                ))
                .toList();

        Order order = buildOrder(userId, addressId, lines);
        cartServiceClient.clearCart();
        return order;
    }

    @Transactional
    public Order reorder(UUID userId, UUID sourceOrderId, UUID addressId) {
        Order source = orderRepository.findByIdAndUserId(sourceOrderId, userId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));

        List<OrderItem> sourceItems = orderItemRepository.findByOrderId(source.getId());
        Map<UUID, List<OrderItemAddon>> addonsByItem = orderItemAddonRepository
                .findByOrderItemIdIn(sourceItems.stream().map(OrderItem::getId).toList())
                .stream().collect(Collectors.groupingBy(OrderItemAddon::getOrderItemId));

        List<LineItem> lines = sourceItems.stream()
                .map(item -> new LineItem(
                        item.getMenuItemId(), item.getQuantity(),
                        addonsByItem.getOrDefault(item.getId(), List.of()).stream().map(OrderItemAddon::getAddonId).toList()
                ))
                .toList();

        return buildOrder(userId, addressId, lines);
    }

    private Order buildOrder(UUID userId, UUID addressId, List<LineItem> lines) {
        AddressView address = resilientDependencyClient.fetchAddress(addressId);
        AddressSnapshot addressSnapshot = new AddressSnapshot(
                address.label(), address.line1(), address.line2(), address.city(), address.state(), address.postalCode()
        );

        BigDecimal subtotal = BigDecimal.ZERO;
        record Prepared(UUID menuItemId, String name, BigDecimal unitPrice, int quantity, BigDecimal lineTotal, List<AddonView> addons) {
        }
        List<Prepared> prepared = new java.util.ArrayList<>();

        for (LineItem line : lines) {
            MenuItemView menuItem = resilientDependencyClient.fetchMenuItem(line.menuItemId());
            if (!menuItem.available()) {
                throw ApiException.badRequest("\"" + menuItem.name() + "\" is no longer available");
            }
            List<AddonView> resolvedAddons = new java.util.ArrayList<>();
            BigDecimal addonsTotal = BigDecimal.ZERO;
            if (!line.addonIds().isEmpty()) {
                List<AddonView> available = resilientDependencyClient.fetchAddons(line.menuItemId());
                Map<UUID, AddonView> byId = available.stream().collect(Collectors.toMap(AddonView::id, a -> a));
                for (UUID addonId : line.addonIds()) {
                    AddonView addon = byId.get(addonId);
                    if (addon == null) {
                        throw ApiException.badRequest("Addon " + addonId + " is no longer valid for " + menuItem.name());
                    }
                    resolvedAddons.add(addon);
                    addonsTotal = addonsTotal.add(addon.price());
                }
            }
            BigDecimal lineTotal = menuItem.price().add(addonsTotal).multiply(BigDecimal.valueOf(line.quantity()));
            subtotal = subtotal.add(lineTotal);
            prepared.add(new Prepared(menuItem.id(), menuItem.name(), menuItem.price(), line.quantity(), lineTotal, resolvedAddons));
        }

        Order order = new Order(userId, addressSnapshot, subtotal, subtotal);
        order = orderRepository.save(order);

        for (Prepared item : prepared) {
            OrderItem orderItem = orderItemRepository.save(new OrderItem(
                    order.getId(), item.menuItemId(), item.name(), item.unitPrice(), item.quantity(), item.lineTotal()
            ));
            for (AddonView addon : item.addons()) {
                orderItemAddonRepository.save(new OrderItemAddon(orderItem.getId(), addon.id(), addon.name(), addon.price()));
            }
        }

        orderStatusHistoryRepository.save(new OrderStatusHistory(order.getId(), OrderStatus.PLACED, "Order placed"));
        publishStatusEvent(order, OrderStatus.PLACED, order.getTotal().toString());
        return order;
    }

    @Transactional(readOnly = true)
    public List<Order> listOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Order> listAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Order getOrder(UUID userId, UUID orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
    }

    /** Internal-only: no owner check, used by other services (e.g. delivery-service) to enrich their own views. */
    @Transactional(readOnly = true)
    public Order getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
    }

    @Transactional(readOnly = true)
    public List<OrderItem> getOrderItems(UUID orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<OrderItemAddon>> getAddonsByItem(List<UUID> orderItemIds) {
        if (orderItemIds.isEmpty()) {
            return Map.of();
        }
        return orderItemAddonRepository.findByOrderItemIdIn(orderItemIds).stream()
                .collect(Collectors.groupingBy(OrderItemAddon::getOrderItemId));
    }

    @Transactional(readOnly = true)
    public List<OrderStatusHistory> getTimeline(UUID userId, UUID orderId) {
        getOrder(userId, orderId);
        return orderStatusHistoryRepository.findByOrderIdOrderByChangedAtAsc(orderId);
    }

    @Transactional
    public Order cancel(UUID userId, UUID orderId, String reason) {
        Order order = getOrder(userId, orderId);
        if (!order.getStatus().isCustomerCancellable()) {
            throw new ApiException(org.springframework.http.HttpStatus.CONFLICT, "CONFLICT",
                    "Order can no longer be cancelled; it is already " + order.getStatus());
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        orderRepository.save(order);
        orderStatusHistoryRepository.save(new OrderStatusHistory(order.getId(), OrderStatus.CANCELLED, reason));
        publishStatusEvent(order, OrderStatus.CANCELLED, null);
        refundIfPaid(order.getId());
        return order;
    }

    /** Best-effort: a cancelled order should never fail to cancel just because the refund call hiccupped. */
    private void refundIfPaid(UUID orderId) {
        try {
            paymentServiceClient.refundByOrder(orderId);
        } catch (Exception e) {
            log.error("Failed to auto-refund payment for cancelled order {}", orderId, e);
        }
    }

    @Transactional
    public Order advanceStatus(UUID orderId, OrderStatus next) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (!order.getStatus().canTransitionTo(next)) {
            throw new ApiException(org.springframework.http.HttpStatus.CONFLICT, "CONFLICT",
                    "Cannot transition order from " + order.getStatus() + " to " + next);
        }
        order.setStatus(next);
        orderRepository.save(order);
        orderStatusHistoryRepository.save(new OrderStatusHistory(order.getId(), next, null));
        publishStatusEvent(order, next, null);
        return order;
    }

    /**
     * One choke point for every order-lifecycle event, published to
     * spicyeat.order.events via the outbox (same DB transaction as the
     * status write above). notification-service consumes the subset it
     * cares about (PLACED/CONFIRMED/OUT_FOR_DELIVERY) and turns those into
     * emails — this service no longer calls notification-service directly.
     */
    private void publishStatusEvent(Order order, OrderStatus status, String total) {
        Map<String, String> payload = total == null
                ? Map.of("orderId", order.getId().toString(), "userId", order.getUserId().toString())
                : Map.of("orderId", order.getId().toString(), "userId", order.getUserId().toString(), "total", total);
        outboxRecorder.record(order.getId().toString(), "ORDER_" + status.name(), payload);
    }

    private record LineItem(UUID menuItemId, int quantity, List<UUID> addonIds) {
    }
}
