package com.spicyeat.notification.web.dto;

import com.spicyeat.notification.domain.NotificationType;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public record SendNotificationRequest(
        @NotNull NotificationType type,
        @NotNull UUID userId,
        Map<String, String> data
) {
}
