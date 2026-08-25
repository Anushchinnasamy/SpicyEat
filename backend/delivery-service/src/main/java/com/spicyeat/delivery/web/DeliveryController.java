package com.spicyeat.delivery.web;

import com.spicyeat.common.security.CurrentUser;
import com.spicyeat.common.security.Role;
import com.spicyeat.delivery.service.DeliveryService;
import com.spicyeat.delivery.web.dto.CreateDeliveryRequest;
import com.spicyeat.delivery.web.dto.DeliveryResponse;
import com.spicyeat.delivery.web.dto.EarningResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    /**
     * Internal creation hook, called by payment-service once a payment
     * succeeds. Requires ADMIN because it is only ever reached either by a
     * real admin or by another backend service self-asserting that identity
     * on the private network (see InternalServiceCallInterceptor) — never by
     * an ordinary customer or delivery partner.
     */
    @PostMapping
    public ResponseEntity<DeliveryResponse> create(HttpServletRequest request, @Valid @RequestBody CreateDeliveryRequest body) {
        CurrentUser.requireRole(request, Role.ADMIN);
        return ResponseEntity.status(HttpStatus.CREATED).body(DeliveryResponse.from(deliveryService.createForOrder(body.orderId())));
    }

    @GetMapping("/available")
    public List<DeliveryResponse> available(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        return deliveryService.listAvailable().stream().map(DeliveryResponse::from).toList();
    }

    @GetMapping("/active")
    public List<DeliveryResponse> active(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return deliveryService.listActive(partnerId).stream().map(DeliveryResponse::from).toList();
    }

    @GetMapping("/history")
    public List<DeliveryResponse> history(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return deliveryService.listHistory(partnerId).stream().map(DeliveryResponse::from).toList();
    }

    @GetMapping("/earnings")
    public List<EarningResponse> earnings(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return deliveryService.listEarnings(partnerId).stream().map(EarningResponse::from).toList();
    }

    @PostMapping("/{id}/accept")
    public DeliveryResponse accept(HttpServletRequest request, @PathVariable UUID id) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return DeliveryResponse.from(deliveryService.accept(partnerId, id));
    }

    @PostMapping("/{id}/pickup")
    public DeliveryResponse pickup(HttpServletRequest request, @PathVariable UUID id) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return DeliveryResponse.from(deliveryService.pickup(partnerId, id));
    }

    @PostMapping("/{id}/start")
    public DeliveryResponse start(HttpServletRequest request, @PathVariable UUID id) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return DeliveryResponse.from(deliveryService.start(partnerId, id));
    }

    @PostMapping("/{id}/complete")
    public DeliveryResponse complete(HttpServletRequest request, @PathVariable UUID id) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return DeliveryResponse.from(deliveryService.complete(partnerId, id));
    }
}
