package com.spicyeat.auth.client;

import com.spicyeat.common.feign.InternalServiceCallFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service-auth-client", url = "${spicyeat.services.notification-uri}", configuration = InternalServiceCallFeignConfig.class)
public interface NotificationServiceClient {

    @PostMapping("/api/notifications")
    void send(@RequestBody SendNotificationRequest request);
}
