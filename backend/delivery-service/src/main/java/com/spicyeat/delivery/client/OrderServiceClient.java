package com.spicyeat.delivery.client;

import com.spicyeat.common.feign.InternalServiceCallFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "order-service-delivery-client", url = "${spicyeat.services.order-uri}", configuration = InternalServiceCallFeignConfig.class)
public interface OrderServiceClient {

    @PostMapping("/api/orders/{id}/status")
    void updateStatus(@PathVariable("id") UUID orderId, @RequestBody Map<String, String> body);
}
