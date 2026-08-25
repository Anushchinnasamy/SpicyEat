package com.spicyeat.order.client;

import com.spicyeat.common.error.ApiException;
import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Wraps the checkout-path calls to menu-service/user-service with a circuit
 * breaker + retry. These have to be on a separate bean, not private methods
 * on OrderService — Spring's proxy-based AOP only intercepts calls that come
 * in through the bean's proxy, not a class calling its own private methods.
 * Retries are safe here because every wrapped call is a GET (idempotent);
 * see plan section 22's "do not blindly retry non-idempotent operations".
 */
@Component
public class ResilientDependencyClient {

    private final MenuServiceClient menuServiceClient;
    private final UserServiceClient userServiceClient;

    public ResilientDependencyClient(MenuServiceClient menuServiceClient, UserServiceClient userServiceClient) {
        this.menuServiceClient = menuServiceClient;
        this.userServiceClient = userServiceClient;
    }

    @CircuitBreaker(name = "menuService", fallbackMethod = "menuItemFallback")
    @Retry(name = "menuService")
    public MenuItemView fetchMenuItem(UUID menuItemId) {
        try {
            return menuServiceClient.getMenuItem(menuItemId);
        } catch (FeignException.NotFound e) {
            throw ApiException.badRequest("Menu item " + menuItemId + " no longer exists");
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

    @CircuitBreaker(name = "userService", fallbackMethod = "addressFallback")
    @Retry(name = "userService")
    public AddressView fetchAddress(UUID addressId) {
        try {
            return userServiceClient.getAddress(addressId);
        } catch (FeignException.NotFound e) {
            throw ApiException.badRequest("Delivery address not found");
        }
    }

    @SuppressWarnings("unused")
    private AddressView addressFallback(UUID addressId, Exception e) {
        throw ApiException.badRequest("Could not verify your delivery address right now, please try again shortly");
    }
}
