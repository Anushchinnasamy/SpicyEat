package com.spicyeat.payment.repository;

import com.spicyeat.payment.domain.Refund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RefundRepository extends JpaRepository<Refund, UUID> {
    List<Refund> findByPaymentIdOrderByCreatedAtAsc(UUID paymentId);
}
