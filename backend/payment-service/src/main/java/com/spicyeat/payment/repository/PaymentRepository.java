package com.spicyeat.payment.repository;

import com.spicyeat.payment.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);
    Optional<Payment> findByIdAndUserId(UUID id, UUID userId);
    Optional<Payment> findFirstByOrderIdOrderByCreatedAtDesc(UUID orderId);
}
