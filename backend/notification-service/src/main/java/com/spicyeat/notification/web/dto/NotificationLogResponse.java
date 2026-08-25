package com.spicyeat.notification.web.dto;

import com.spicyeat.notification.domain.NotificationLog;

import java.time.Instant;
import java.util.UUID;

public record NotificationLogResponse(
        UUID id,
        String type,
        UUID userId,
        String recipientEmail,
        String subject,
        String status,
        String providerMessageId,
        String failureReason,
        Instant createdAt
) {
    public static NotificationLogResponse from(NotificationLog log) {
        return new NotificationLogResponse(
                log.getId(), log.getType().name(), log.getUserId(), log.getRecipientEmail(), log.getSubject(),
                log.getStatus().name(), log.getProviderMessageId(), log.getFailureReason(), log.getCreatedAt()
        );
    }
}
