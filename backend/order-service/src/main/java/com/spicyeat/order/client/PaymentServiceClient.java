package com.spicyeat.order.client;

import com.spicyeat.common.feign.InternalServiceCallFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.UUID;

@FeignClient(name = "payment-service-order-client", url = "${spicyeat.services.payment-uri}", configuration = InternalServiceCallFeignConfig.class)
public interface PaymentServiceClient {

    @PostMapping("/api/payments/internal/refund-by-order/{orderId}")
    void refundByOrder(@PathVariable("orderId") UUID orderId);
}
