package com.spicyeat.cart.client;

import com.spicyeat.common.error.ApiException;
import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Separate bean so resilience4j's proxy-based AOP actually intercepts these
 * calls — see the identical note on order-service's ResilientDependencyClient.
 */
@Component
public class ResilientMenuClient {

    private final MenuServiceClient menuServiceClient;

    public ResilientMenuClient(MenuServiceClient menuServiceClient) {
        this.menuServiceClient = menuServiceClient;
    }

    @CircuitBreaker(name = "menuService", fallbackMethod = "menuItemFallback")
    @Retry(name = "menuService")
    public MenuItemView fetchMenuItem(UUID menuItemId) {
        try {
            return menuServiceClient.getMenuItem(menuItemId);
        } catch (FeignException.NotFound e) {
            throw ApiException.badRequest("Menu item not found");
        }
    }

    @SuppressWarnings("unused")
    private MenuItemView menuItemFallback(UUID menuItemId, Exception e) {
        throw ApiException.badRequest("Menu is temporarily unavailable, please try again shortly");
    }

    @CircuitBreaker(name = "menuService")
    @Retry(name = "menuService")
    public List<AddonView> fetchAddons(UUID menuItemId) {
        return menuServiceClient.getAddons(menuItemId);
    }
}
