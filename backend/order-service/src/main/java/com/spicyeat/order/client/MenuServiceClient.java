package com.spicyeat.order.client;

import com.spicyeat.common.feign.ForwardedHeadersFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "menu-service-order-client", url = "${spicyeat.services.menu-uri}", configuration = ForwardedHeadersFeignConfig.class)
public interface MenuServiceClient {

    @GetMapping("/api/menu/{id}")
    MenuItemView getMenuItem(@PathVariable("id") UUID id);

    @GetMapping("/api/menu/{id}/addons")
    List<AddonView> getAddons(@PathVariable("id") UUID id);
}
