package com.spicyeat.delivery.service;

import com.spicyeat.common.error.ApiException;
import com.spicyeat.delivery.client.OrderServiceClient;
import com.spicyeat.delivery.domain.Delivery;
import com.spicyeat.delivery.domain.DeliveryPartnerProfile;
import com.spicyeat.delivery.domain.DeliveryStatus;
import com.spicyeat.delivery.domain.DeliveryStatusHistory;
import com.spicyeat.delivery.domain.Earning;
import com.spicyeat.delivery.repository.DeliveryPartnerProfileRepository;
import com.spicyeat.delivery.repository.DeliveryRepository;
import com.spicyeat.delivery.repository.DeliveryStatusHistoryRepository;
import com.spicyeat.delivery.repository.EarningRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DeliveryService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryService.class);

    /** Flat payout per completed delivery. A real system would price this by distance/time; out of scope here. */
    private static final BigDecimal FLAT_EARNING_PER_DELIVERY = new BigDecimal("5.00");

    private final DeliveryRepository deliveryRepository;
    private final DeliveryStatusHistoryRepository historyRepository;
    private final EarningRepository earningRepository;
    private final OrderServiceClient orderServiceClient;
    private final DeliveryPartnerProfileRepository partnerProfileRepository;

    public DeliveryService(
            DeliveryRepository deliveryRepository,
            DeliveryStatusHistoryRepository historyRepository,
            EarningRepository earningRepository,
            OrderServiceClient orderServiceClient,
            DeliveryPartnerProfileRepository partnerProfileRepository
    ) {
        this.deliveryRepository = deliveryRepository;
        this.historyRepository = historyRepository;
        this.earningRepository = earningRepository;
        this.orderServiceClient = orderServiceClient;
        this.partnerProfileRepository = partnerProfileRepository;
    }

    @Transactional
    public DeliveryPartnerProfile getOrCreateProfile(UUID partnerId) {
        return partnerProfileRepository.findById(partnerId)
                .orElseGet(() -> partnerProfileRepository.save(new DeliveryPartnerProfile(partnerId)));
    }

    @Transactional
    public DeliveryPartnerProfile updateProfile(UUID partnerId, String vehicle) {
        DeliveryPartnerProfile profile = getOrCreateProfile(partnerId);
        profile.setVehicle(vehicle);
        return partnerProfileRepository.save(profile);
    }

    @Transactional
    public DeliveryPartnerProfile setOnline(UUID partnerId, boolean online) {
        DeliveryPartnerProfile profile = getOrCreateProfile(partnerId);
        profile.setOnline(online);
        return partnerProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public List<DeliveryPartnerProfile> listAllPartnerProfiles() {
        return partnerProfileRepository.findAll();
    }

    @Transactional(readOnly = true)
    public long countCompletedDeliveries(UUID partnerId) {
        return deliveryRepository.countByPartnerIdAndStatus(partnerId, DeliveryStatus.DELIVERED);
    }

    /** Called internally by payment-service once a payment succeeds; idempotent per orderId. */
    @Transactional
    public Delivery createForOrder(UUID orderId) {
        return deliveryRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Delivery delivery = deliveryRepository.save(new Delivery(orderId));
                    historyRepository.save(new DeliveryStatusHistory(delivery.getId(), DeliveryStatus.UNASSIGNED));
                    return delivery;
                });
    }

    @Transactional(readOnly = true)
    public List<Delivery> listAvailable() {
        return deliveryRepository.findByStatus(DeliveryStatus.UNASSIGNED);
    }

    @Transactional(readOnly = true)
    public List<Delivery> listActive(UUID partnerId) {
        return deliveryRepository.findByPartnerIdAndStatusIn(
                partnerId, List.of(DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.OUT_FOR_DELIVERY));
    }

    @Transactional(readOnly = true)
    public List<Delivery> listHistory(UUID partnerId) {
        return deliveryRepository.findByPartnerIdAndStatusIn(
                partnerId, List.of(DeliveryStatus.DELIVERED, DeliveryStatus.FAILED));
    }

    @Transactional(readOnly = true)
    public List<Earning> listEarnings(UUID partnerId) {
        return earningRepository.findByPartnerIdOrderByCreatedAtDesc(partnerId);
    }

    @Transactional
    public Delivery accept(UUID partnerId, UUID deliveryId) {
        int claimed = deliveryRepository.claim(deliveryId, partnerId, Instant.now());
        if (claimed == 0) {
            Delivery existing = deliveryRepository.findById(deliveryId)
                    .orElseThrow(() -> ApiException.notFound("Delivery not found"));
            throw ApiException.conflict(existing.getStatus() == DeliveryStatus.UNASSIGNED
                    ? "Failed to claim this delivery, please retry"
                    : "This delivery was already claimed by another partner");
        }
        Delivery delivery = deliveryRepository.findById(deliveryId).orElseThrow();
        historyRepository.save(new DeliveryStatusHistory(delivery.getId(), DeliveryStatus.ASSIGNED));
        mirrorOrderStatus(delivery.getOrderId(), "ASSIGNED");
        return delivery;
    }

    @Transactional
    public Delivery pickup(UUID partnerId, UUID deliveryId) {
        return transition(partnerId, deliveryId, DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, delivery -> {
            delivery.setPickedUpAt(Instant.now());
            mirrorOrderStatus(delivery.getOrderId(), "PICKED_UP");
        });
    }

    @Transactional
    public Delivery start(UUID partnerId, UUID deliveryId) {
        return transition(partnerId, deliveryId, DeliveryStatus.PICKED_UP, DeliveryStatus.OUT_FOR_DELIVERY, delivery ->
                mirrorOrderStatus(delivery.getOrderId(), "OUT_FOR_DELIVERY"));
    }

    @Transactional
    public Delivery complete(UUID partnerId, UUID deliveryId) {
        return transition(partnerId, deliveryId, DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.DELIVERED, delivery -> {
            delivery.setDeliveredAt(Instant.now());
            earningRepository.save(new Earning(partnerId, delivery.getId(), FLAT_EARNING_PER_DELIVERY));
            mirrorOrderStatus(delivery.getOrderId(), "DELIVERED");
        });
    }

    private Delivery transition(UUID partnerId, UUID deliveryId, DeliveryStatus expected, DeliveryStatus next, java.util.function.Consumer<Delivery> onSuccess) {
        Delivery delivery = deliveryRepository.findByIdAndPartnerId(deliveryId, partnerId)
                .orElseThrow(() -> ApiException.notFound("Delivery not found or not assigned to you"));
        if (delivery.getStatus() != expected || !delivery.getStatus().canTransitionTo(next)) {
            throw ApiException.conflict("Cannot move delivery from " + delivery.getStatus() + " to " + next);
        }
        delivery.setStatus(next);
        deliveryRepository.save(delivery);
        historyRepository.save(new DeliveryStatusHistory(delivery.getId(), next));
        onSuccess.accept(delivery);
        return delivery;
    }

    private void mirrorOrderStatus(UUID orderId, String status) {
        try {
            orderServiceClient.updateStatus(orderId, Map.of("status", status));
        } catch (Exception e) {
            log.error("Failed to mirror delivery status {} onto order {}", status, orderId, e);
        }
    }
}
