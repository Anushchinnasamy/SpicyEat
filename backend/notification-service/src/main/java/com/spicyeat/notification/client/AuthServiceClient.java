package com.spicyeat.notification.client;

import com.spicyeat.common.feign.InternalServiceCallFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "auth-service-notification-client", url = "${spicyeat.services.auth-uri}", configuration = InternalServiceCallFeignConfig.class)
public interface AuthServiceClient {

    @GetMapping("/api/auth/internal/users/{id}")
    UserView getUserById(@PathVariable("id") UUID id);
}
