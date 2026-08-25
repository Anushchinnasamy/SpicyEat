package com.spicyeat.order.domain;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PLACED,
    CONFIRMED,
    PREPARING,
    READY_FOR_PICKUP,
    ASSIGNED,
    PICKED_UP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            PLACED, EnumSet.of(CONFIRMED, CANCELLED),
            CONFIRMED, EnumSet.of(PREPARING, CANCELLED),
            PREPARING, EnumSet.of(READY_FOR_PICKUP),
            READY_FOR_PICKUP, EnumSet.of(ASSIGNED),
            ASSIGNED, EnumSet.of(PICKED_UP),
            PICKED_UP, EnumSet.of(OUT_FOR_DELIVERY),
            OUT_FOR_DELIVERY, EnumSet.of(DELIVERED),
            DELIVERED, EnumSet.noneOf(OrderStatus.class),
            CANCELLED, EnumSet.noneOf(OrderStatus.class)
    );

    /** Customer self-service cancellation is only safe before food prep has started. */
    private static final Set<OrderStatus> CUSTOMER_CANCELLABLE = EnumSet.of(PLACED, CONFIRMED);

    public boolean canTransitionTo(OrderStatus next) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(next);
    }

    public boolean isCustomerCancellable() {
        return CUSTOMER_CANCELLABLE.contains(this);
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }
}
