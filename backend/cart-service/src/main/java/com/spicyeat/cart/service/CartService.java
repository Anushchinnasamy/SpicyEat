package com.spicyeat.cart.service;

import com.spicyeat.cart.client.AddonView;
import com.spicyeat.cart.client.MenuItemView;
import com.spicyeat.cart.client.ResilientMenuClient;
import com.spicyeat.cart.domain.Cart;
import com.spicyeat.cart.domain.CartItem;
import com.spicyeat.cart.domain.CartItemAddon;
import com.spicyeat.cart.repository.CartItemAddonRepository;
import com.spicyeat.cart.repository.CartItemRepository;
import com.spicyeat.cart.repository.CartRepository;
import com.spicyeat.cart.web.dto.AddToCartRequest;
import com.spicyeat.common.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CartItemAddonRepository cartItemAddonRepository;
    private final ResilientMenuClient resilientMenuClient;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            CartItemAddonRepository cartItemAddonRepository,
            ResilientMenuClient resilientMenuClient
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.cartItemAddonRepository = cartItemAddonRepository;
        this.resilientMenuClient = resilientMenuClient;
    }

    @Transactional
    public Cart getOrCreateCart(UUID userId) {
        return cartRepository.findById(userId).orElseGet(() -> cartRepository.save(new Cart(userId)));
    }

    @Transactional(readOnly = true)
    public List<CartItem> listItems(UUID userId) {
        return cartItemRepository.findByCartId(userId);
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<CartItemAddon>> listAddonsByItem(List<UUID> cartItemIds) {
        if (cartItemIds.isEmpty()) {
            return Map.of();
        }
        return cartItemAddonRepository.findByCartItemIdIn(cartItemIds).stream()
                .collect(Collectors.groupingBy(CartItemAddon::getCartItemId));
    }

    @Transactional
    public CartItem addItem(UUID userId, AddToCartRequest request) {
        getOrCreateCart(userId);

        MenuItemView menuItem = resilientMenuClient.fetchMenuItem(request.menuItemId());
        if (!menuItem.available()) {
            throw ApiException.badRequest("This item is currently unavailable");
        }

        CartItem cartItem = new CartItem(userId, menuItem.id(), menuItem.name(), menuItem.price(), request.quantity());
        cartItem = cartItemRepository.save(cartItem);

        if (request.addonIds() != null && !request.addonIds().isEmpty()) {
            List<AddonView> availableAddons = resilientMenuClient.fetchAddons(menuItem.id());
            Map<UUID, AddonView> byId = availableAddons.stream().collect(Collectors.toMap(AddonView::id, a -> a));
            for (UUID addonId : request.addonIds()) {
                AddonView addon = byId.get(addonId);
                if (addon == null) {
                    throw ApiException.badRequest("Addon " + addonId + " is not valid for this item");
                }
                cartItemAddonRepository.save(new CartItemAddon(cartItem.getId(), addon.id(), addon.name(), addon.price()));
            }
        }

        return cartItem;
    }

    @Transactional
    public CartItem updateQuantity(UUID userId, UUID cartItemId, int quantity) {
        CartItem item = cartItemRepository.findByIdAndCartId(cartItemId, userId)
                .orElseThrow(() -> ApiException.notFound("Cart item not found"));
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeItem(UUID userId, UUID cartItemId) {
        CartItem item = cartItemRepository.findByIdAndCartId(cartItemId, userId)
                .orElseThrow(() -> ApiException.notFound("Cart item not found"));
        cartItemAddonRepository.deleteByCartItemId(item.getId());
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(UUID userId) {
        for (CartItem item : cartItemRepository.findByCartId(userId)) {
            cartItemAddonRepository.deleteByCartItemId(item.getId());
        }
        cartItemRepository.deleteByCartId(userId);
    }
}
