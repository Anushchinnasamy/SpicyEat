package com.spicyeat.delivery.repository;

import com.spicyeat.delivery.domain.Delivery;
import com.spicyeat.delivery.domain.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {

    List<Delivery> findByStatus(DeliveryStatus status);

    Optional<Delivery> findByOrderId(UUID orderId);

    List<Delivery> findByPartnerIdAndStatusIn(UUID partnerId, List<DeliveryStatus> statuses);

    Optional<Delivery> findByIdAndPartnerId(UUID id, UUID partnerId);

    /**
     * Atomically claims a delivery only if it is still UNASSIGNED. When two
     * partners race to accept the same delivery, exactly one UPDATE affects
     * a row; the loser's affected-row count is 0 and gets a 409, no
     * distributed lock required (plan section 20's "delivery race").
     */
    @Modifying
    @Query("UPDATE Delivery d SET d.status = com.spicyeat.delivery.domain.DeliveryStatus.ASSIGNED, " +
            "d.partnerId = :partnerId, d.assignedAt = :now " +
            "WHERE d.id = :id AND d.status = com.spicyeat.delivery.domain.DeliveryStatus.UNASSIGNED")
    int claim(@Param("id") UUID id, @Param("partnerId") UUID partnerId, @Param("now") Instant now);
}
