package com.spicyeat.notification.service;

import com.spicyeat.common.error.ApiException;
import com.spicyeat.notification.client.AuthServiceClient;
import com.spicyeat.notification.client.UserView;
import com.spicyeat.notification.domain.NotificationLog;
import com.spicyeat.notification.domain.NotificationType;
import com.spicyeat.notification.provider.ResendEmailClient;
import com.spicyeat.notification.repository.NotificationLogRepository;
import com.spicyeat.notification.template.EmailContent;
import com.spicyeat.notification.template.EmailTemplateRenderer;
import feign.FeignException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class NotificationService {

    private final AuthServiceClient authServiceClient;
    private final EmailTemplateRenderer templateRenderer;
    private final ResendEmailClient resendEmailClient;
    private final NotificationLogRepository notificationLogRepository;

    public NotificationService(
            AuthServiceClient authServiceClient,
            EmailTemplateRenderer templateRenderer,
            ResendEmailClient resendEmailClient,
            NotificationLogRepository notificationLogRepository
    ) {
        this.authServiceClient = authServiceClient;
        this.templateRenderer = templateRenderer;
        this.resendEmailClient = resendEmailClient;
        this.notificationLogRepository = notificationLogRepository;
    }

    /**
     * Never throws for a provider failure — a bounced or unconfigured email
     * provider is recorded (status FAILED) rather than surfaced as an error
     * to the business service that triggered the notification, since sending
     * an email is never allowed to block or fail the underlying business
     * operation (an order still gets placed even if the confirmation email
     * doesn't go out).
     */
    @Transactional
    public NotificationLog send(NotificationType type, UUID userId, Map<String, String> data) {
        UserView user = fetchUser(userId);
        EmailContent content = templateRenderer.render(type, data == null ? Map.of() : data);

        NotificationLog log = new NotificationLog(type, userId, user.email(), content.subject());
        ResendEmailClient.SendResult result = resendEmailClient.send(user.email(), content.subject(), content.html());
        if (result.success()) {
            log.markSent(result.messageId());
        } else {
            log.markFailed(result.failureReason());
        }
        return notificationLogRepository.save(log);
    }

    private UserView fetchUser(UUID userId) {
        try {
            return authServiceClient.getUserById(userId);
        } catch (FeignException.NotFound e) {
            throw ApiException.badRequest("Unknown user " + userId);
        }
    }
}
