package com.spicyeat.order.client;

import com.spicyeat.common.feign.ForwardedHeadersFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "cart-service", url = "${spicyeat.services.cart-uri}", configuration = ForwardedHeadersFeignConfig.class)
public interface CartServiceClient {

    @GetMapping("/api/cart")
    CartView getCart();

    @DeleteMapping("/api/cart")
    void clearCart();
}
