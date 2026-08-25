package com.spicyeat.delivery.domain;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * The plan's state list also names ASSIGNED and ACCEPTED as distinct states,
 * modeling a system-auto-assigns-then-partner-confirms flow. This service
 * only exposes a single "accept" action (there is no separate assignment
 * step), so claiming a delivery moves it straight from UNASSIGNED to
 * ASSIGNED in one atomic step; ACCEPTED is folded into that transition
 * rather than kept as an unreachable state.
 */
public enum DeliveryStatus {
    UNASSIGNED,
    ASSIGNED,
    PICKED_UP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    FAILED;

    private static final Map<DeliveryStatus, Set<DeliveryStatus>> ALLOWED_TRANSITIONS = Map.of(
            UNASSIGNED, EnumSet.of(ASSIGNED),
            ASSIGNED, EnumSet.of(PICKED_UP, FAILED),
            PICKED_UP, EnumSet.of(OUT_FOR_DELIVERY, FAILED),
            OUT_FOR_DELIVERY, EnumSet.of(DELIVERED, FAILED),
            DELIVERED, EnumSet.noneOf(DeliveryStatus.class),
            FAILED, EnumSet.noneOf(DeliveryStatus.class)
    );

    public boolean canTransitionTo(DeliveryStatus next) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(next);
    }
}
