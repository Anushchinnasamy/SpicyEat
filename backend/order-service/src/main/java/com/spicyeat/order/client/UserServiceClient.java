package com.spicyeat.order.client;

import com.spicyeat.common.feign.ForwardedHeadersFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service-order-client", url = "${spicyeat.services.user-uri}", configuration = ForwardedHeadersFeignConfig.class)
public interface UserServiceClient {

    @GetMapping("/api/users/me/addresses/{id}")
    AddressView getAddress(@PathVariable("id") UUID id);
}
