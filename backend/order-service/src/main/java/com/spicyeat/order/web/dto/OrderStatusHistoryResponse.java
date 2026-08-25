package com.spicyeat.order.web.dto;

import com.spicyeat.order.domain.OrderStatusHistory;

import java.time.Instant;

public record OrderStatusHistoryResponse(String status, String note, Instant changedAt) {
    public static OrderStatusHistoryResponse from(OrderStatusHistory history) {
        return new OrderStatusHistoryResponse(history.getStatus().name(), history.getNote(), history.getChangedAt());
    }
}
