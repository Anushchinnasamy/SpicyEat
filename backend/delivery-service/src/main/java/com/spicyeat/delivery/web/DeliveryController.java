package com.spicyeat.delivery.web;

import com.spicyeat.common.security.CurrentUser;
import com.spicyeat.common.security.Role;
import com.spicyeat.delivery.client.OrderServiceClient;
import com.spicyeat.delivery.client.OrderSummary;
import com.spicyeat.delivery.domain.Delivery;
import com.spicyeat.delivery.service.DeliveryService;
import com.spicyeat.delivery.web.dto.AdminPartnerResponse;
import com.spicyeat.delivery.web.dto.CreateDeliveryRequest;
import com.spicyeat.delivery.web.dto.DeliveryResponse;
import com.spicyeat.delivery.web.dto.EarningResponse;
import com.spicyeat.delivery.web.dto.PartnerProfileResponse;
import com.spicyeat.delivery.web.dto.SetOnlineRequest;
import com.spicyeat.delivery.web.dto.UpdatePartnerProfileRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private static final Logger log = LoggerFactory.getLogger(DeliveryController.class);

    private final DeliveryService deliveryService;
    private final OrderServiceClient orderServiceClient;

    public DeliveryController(DeliveryService deliveryService, OrderServiceClient orderServiceClient) {
        this.deliveryService = deliveryService;
        this.orderServiceClient = orderServiceClient;
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
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(deliveryService.createForOrder(body.orderId())));
    }

    @GetMapping("/available")
    public List<DeliveryResponse> available(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        return deliveryService.listAvailable().stream().map(this::toResponse).toList();
    }

    @GetMapping("/active")
    public List<DeliveryResponse> active(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return deliveryService.listActive(partnerId).stream().map(this::toResponse).toList();
    }

    @GetMapping("/history")
    public List<DeliveryResponse> history(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return deliveryService.listHistory(partnerId).stream().map(this::toResponse).toList();
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
        return toResponse(deliveryService.accept(partnerId, id));
    }

    @PostMapping("/{id}/pickup")
    public DeliveryResponse pickup(HttpServletRequest request, @PathVariable UUID id) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return toResponse(deliveryService.pickup(partnerId, id));
    }

    @PostMapping("/{id}/start")
    public DeliveryResponse start(HttpServletRequest request, @PathVariable UUID id) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return toResponse(deliveryService.start(partnerId, id));
    }

    @PostMapping("/{id}/complete")
    public DeliveryResponse complete(HttpServletRequest request, @PathVariable UUID id) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return toResponse(deliveryService.complete(partnerId, id));
    }

    @GetMapping("/profile")
    public PartnerProfileResponse profile(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return PartnerProfileResponse.from(deliveryService.getOrCreateProfile(partnerId));
    }

    @PutMapping("/profile")
    public PartnerProfileResponse updateProfile(HttpServletRequest request, @Valid @RequestBody UpdatePartnerProfileRequest body) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return PartnerProfileResponse.from(deliveryService.updateProfile(partnerId, body.vehicle()));
    }

    @PostMapping("/profile/online")
    public PartnerProfileResponse setOnline(HttpServletRequest request, @Valid @RequestBody SetOnlineRequest body) {
        CurrentUser.requireRole(request, Role.DELIVERY_PARTNER);
        UUID partnerId = CurrentUser.userId(request);
        return PartnerProfileResponse.from(deliveryService.setOnline(partnerId, body.online()));
    }

    @GetMapping("/admin/partners")
    public List<AdminPartnerResponse> listPartners(HttpServletRequest request) {
        CurrentUser.requireRole(request, Role.ADMIN);
        return deliveryService.listAllPartnerProfiles().stream()
                .map(profile -> AdminPartnerResponse.from(profile, deliveryService.countCompletedDeliveries(profile.getUserId())))
                .toList();
    }

    /** Best-effort enrichment with order details; a slow/unavailable order-service degrades to bare delivery data. */
    private DeliveryResponse toResponse(Delivery delivery) {
        try {
            OrderSummary order = orderServiceClient.getOrder(delivery.getOrderId());
            return DeliveryResponse.from(delivery, order);
        } catch (Exception e) {
            log.warn("Failed to enrich delivery {} with order {} details", delivery.getId(), delivery.getOrderId(), e);
            return DeliveryResponse.from(delivery);
        }
    }
}
