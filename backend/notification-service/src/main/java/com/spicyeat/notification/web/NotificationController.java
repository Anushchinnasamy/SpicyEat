package com.spicyeat.notification.web;

import com.spicyeat.common.security.CurrentUser;
import com.spicyeat.common.security.Role;
import com.spicyeat.notification.domain.NotificationLog;
import com.spicyeat.notification.service.NotificationService;
import com.spicyeat.notification.web.dto.NotificationLogResponse;
import com.spicyeat.notification.web.dto.SendNotificationRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Internal-only: every caller here is another backend service (or an admin)
 * self-asserting trust the same way order-service and delivery-service do —
 * see com.spicyeat.common.feign.InternalServiceCallInterceptor. There is no
 * customer-facing use of this API.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<NotificationLogResponse> send(HttpServletRequest request, @Valid @RequestBody SendNotificationRequest body) {
        CurrentUser.requireRole(request, Role.ADMIN);
        NotificationLog log = notificationService.send(body.type(), body.userId(), body.data());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(NotificationLogResponse.from(log));
    }
}
