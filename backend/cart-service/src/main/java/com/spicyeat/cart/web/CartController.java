package com.spicyeat.cart.web;

import com.spicyeat.cart.domain.CartItem;
import com.spicyeat.cart.domain.CartItemAddon;
import com.spicyeat.cart.service.CartService;
import com.spicyeat.cart.web.dto.*;
import com.spicyeat.common.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getCart(HttpServletRequest request) {
        UUID userId = CurrentUser.userId(request);
        return buildCartResponse(userId);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(HttpServletRequest request, @Valid @RequestBody AddToCartRequest body) {
        UUID userId = CurrentUser.userId(request);
        cartService.addItem(userId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildCartResponse(userId));
    }

    @PutMapping("/items/{id}")
    public CartResponse updateItem(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody UpdateCartItemRequest body) {
        UUID userId = CurrentUser.userId(request);
        cartService.updateQuantity(userId, id, body.quantity());
        return buildCartResponse(userId);
    }

    @DeleteMapping("/items/{id}")
    public CartResponse removeItem(HttpServletRequest request, @PathVariable UUID id) {
        UUID userId = CurrentUser.userId(request);
        cartService.removeItem(userId, id);
        return buildCartResponse(userId);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(HttpServletRequest request) {
        UUID userId = CurrentUser.userId(request);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    private CartResponse buildCartResponse(UUID userId) {
        List<CartItem> items = cartService.listItems(userId);
        Map<UUID, List<CartItemAddon>> addonsByItem = cartService.listAddonsByItem(items.stream().map(CartItem::getId).toList());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<CartItemResponse> itemResponses = new java.util.ArrayList<>();
        for (CartItem item : items) {
            List<CartItemAddon> addons = addonsByItem.getOrDefault(item.getId(), List.of());
            BigDecimal addonsTotal = addons.stream().map(CartItemAddon::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal lineTotal = item.getUnitPrice().add(addonsTotal).multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);
            itemResponses.add(new CartItemResponse(
                    item.getId(), item.getMenuItemId(), item.getItemName(), item.getUnitPrice(), item.getQuantity(),
                    addons.stream().map(CartItemAddonResponse::from).toList(), lineTotal
            ));
        }
        return new CartResponse(userId, itemResponses, subtotal);
    }
}
