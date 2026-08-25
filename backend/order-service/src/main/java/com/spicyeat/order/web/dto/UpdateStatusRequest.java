package com.spicyeat.order.web.dto;

import com.spicyeat.order.domain.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull OrderStatus status) {
}
