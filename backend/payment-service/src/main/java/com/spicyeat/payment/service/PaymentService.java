package com.spicyeat.payment.service;

import com.spicyeat.common.error.ApiException;
import com.spicyeat.payment.domain.*;
import com.spicyeat.payment.outbox.OutboxRecorder;
import com.spicyeat.payment.provider.StripePaymentProvider;
import com.spicyeat.payment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RefundRepository refundRepository;
    private final ProcessedWebhookEventRepository processedWebhookEventRepository;
    private final StripePaymentProvider paymentProvider;
    private final OutboxRecorder outboxRecorder;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentAttemptRepository paymentAttemptRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            RefundRepository refundRepository,
            ProcessedWebhookEventRepository processedWebhookEventRepository,
            StripePaymentProvider paymentProvider,
            OutboxRecorder outboxRecorder
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.refundRepository = refundRepository;
        this.processedWebhookEventRepository = processedWebhookEventRepository;
        this.paymentProvider = paymentProvider;
        this.outboxRecorder = outboxRecorder;
    }

    @Transactional
    public PaymentCreationResult createPayment(UUID userId, UUID orderId, BigDecimal amount, String idempotencyKey) {
        var existing = paymentRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey);
        if (existing.isPresent()) {
            Payment payment = existing.get();
            if (!payment.getOrderId().equals(orderId)) {
                throw ApiException.conflict("Idempotency key was already used for a different order");
            }
            return new PaymentCreationResult(payment, null); // safe replay: no new charge attempt, no duplicate side effects
        }

        Payment payment = paymentRepository.save(new Payment(orderId, userId, amount, idempotencyKey));
        String clientSecret = attemptCharge(payment, idempotencyKey);
        return new PaymentCreationResult(payment, clientSecret);
    }

    private String attemptCharge(Payment payment, String idempotencyKey) {
        StripePaymentProvider.ChargeResult result =
                paymentProvider.charge(payment.getId(), payment.getOrderId(), payment.getAmount(), idempotencyKey);
        int attemptNumber = paymentAttemptRepository.countByPaymentId(payment.getId()) + 1;
        paymentAttemptRepository.save(new PaymentAttempt(
                payment.getId(), attemptNumber, result.status(), result.providerReference(), result.failureReason()
        ));
        payment.setStatus(result.status());
        payment.setProviderReference(result.providerReference());
        paymentRepository.save(payment);
        paymentTransactionRepository.save(new PaymentTransaction(
                payment.getId(), TransactionType.CHARGE, payment.getAmount(), result.status(), result.providerReference()
        ));

        if (result.status() == PaymentStatus.SUCCESS) {
            onPaymentSucceeded(payment);
        } else if (result.status() == PaymentStatus.FAILED) {
            onPaymentFailed(payment, result.failureReason());
        }
        return result.clientSecret();
    }

    public record PaymentCreationResult(Payment payment, String clientSecret) {
    }

    @Transactional(readOnly = true)
    public Payment getPayment(UUID userId, UUID paymentId) {
        return paymentRepository.findByIdAndUserId(paymentId, userId)
                .orElseThrow(() -> ApiException.notFound("Payment not found"));
    }

    /** Admins can look up any order's payment; everyone else only their own. */
    public Payment getPaymentByOrder(UUID orderId, UUID callerUserId, boolean isAdmin) {
        Payment payment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> ApiException.notFound("No payment found for that order"));
        if (!isAdmin && !payment.getUserId().equals(callerUserId)) {
            throw ApiException.notFound("No payment found for that order");
        }
        return payment;
    }

    /**
     * Called by order-service when a customer cancels an order: refunds
     * whatever remains on that order's payment in full, automatically. A
     * no-op (not an error) if there's no payment yet, or nothing left to
     * refund — cancellation shouldn't fail just because there was no charge.
     */
    @Transactional
    public Optional<Payment> refundFullyByOrder(UUID orderId) {
        Optional<Payment> maybePayment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId);
        if (maybePayment.isEmpty()) {
            return Optional.empty();
        }
        Payment payment = maybePayment.get();
        if (payment.getStatus() != PaymentStatus.SUCCESS && payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            return Optional.of(payment);
        }
        BigDecimal remaining = payment.getAmount().subtract(payment.getRefundedAmount());
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            return Optional.of(payment);
        }
        return Optional.of(refund(payment.getId(), remaining, "Order cancelled"));
    }

    @Transactional
    public Payment verify(UUID userId, UUID paymentId) {
        Payment payment = getPayment(userId, paymentId);
        if (payment.getStatus() != PaymentStatus.PROCESSING) {
            return payment; // terminal already; verify is a safe no-op
        }

        StripePaymentProvider.ChargeResult result = paymentProvider.verify(payment.getProviderReference(), payment.getStatus());
        int attemptNumber = paymentAttemptRepository.countByPaymentId(payment.getId()) + 1;
        paymentAttemptRepository.save(new PaymentAttempt(
                payment.getId(), attemptNumber, result.status(), result.providerReference(), result.failureReason()
        ));
        payment.setStatus(result.status());
        paymentRepository.save(payment);
        paymentTransactionRepository.save(new PaymentTransaction(
                payment.getId(), TransactionType.CHARGE, payment.getAmount(), result.status(), result.providerReference()
        ));

        if (result.status() == PaymentStatus.SUCCESS) {
            onPaymentSucceeded(payment);
        } else if (result.status() == PaymentStatus.FAILED) {
            onPaymentFailed(payment, result.failureReason());
        }
        return payment;
    }

    /** Admin-only: refunds are a support/back-office action, not something the payer triggers directly. */
    @Transactional
    public Payment refund(UUID paymentId, BigDecimal amount, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> ApiException.notFound("Payment not found"));

        if (payment.getStatus() != PaymentStatus.SUCCESS && payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw ApiException.badRequest("Only a successfully charged payment can be refunded");
        }
        BigDecimal remaining = payment.getAmount().subtract(payment.getRefundedAmount());
        if (amount.compareTo(remaining) > 0) {
            throw ApiException.badRequest("Refund amount exceeds the remaining refundable balance of " + remaining);
        }

        StripePaymentProvider.RefundResult result = paymentProvider.refund(payment.getProviderReference(), amount);
        refundRepository.save(new Refund(payment.getId(), amount, reason, result.status()));
        paymentTransactionRepository.save(new PaymentTransaction(
                payment.getId(), TransactionType.REFUND, amount, result.status(), result.providerReference()
        ));

        BigDecimal newRefundedAmount = payment.getRefundedAmount().add(amount);
        payment.setRefundedAmount(newRefundedAmount);
        payment.setStatus(newRefundedAmount.compareTo(payment.getAmount()) >= 0
                ? PaymentStatus.REFUNDED
                : PaymentStatus.PARTIALLY_REFUNDED);
        Payment saved = paymentRepository.save(payment);

        outboxRecorder.record(saved.getOrderId().toString(), "REFUND_PROCESSED", Map.of(
                "orderId", saved.getOrderId().toString(), "userId", saved.getUserId().toString(), "amount", amount.toString()
        ));
        return saved;
    }

    /** Idempotent by design: a redelivered webhook with the same eventId is a no-op. */
    @Transactional
    public void handleWebhook(String eventId, UUID paymentId, PaymentStatus reportedStatus, String providerReference) {
        if (processedWebhookEventRepository.existsByEventId(eventId)) {
            return;
        }
        processedWebhookEventRepository.save(new ProcessedWebhookEvent(eventId));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> ApiException.notFound("Payment not found"));
        if (payment.getStatus() != PaymentStatus.PROCESSING) {
            return; // already resolved locally; the webhook is stale or redundant
        }

        int attemptNumber = paymentAttemptRepository.countByPaymentId(payment.getId()) + 1;
        paymentAttemptRepository.save(new PaymentAttempt(payment.getId(), attemptNumber, reportedStatus, providerReference, null));
        payment.setStatus(reportedStatus);
        if (providerReference != null) {
            payment.setProviderReference(providerReference);
        }
        paymentRepository.save(payment);
        paymentTransactionRepository.save(new PaymentTransaction(
                payment.getId(), TransactionType.CHARGE, payment.getAmount(), reportedStatus, providerReference
        ));

        if (reportedStatus == PaymentStatus.SUCCESS) {
            onPaymentSucceeded(payment);
        } else if (reportedStatus == PaymentStatus.FAILED) {
            onPaymentFailed(payment, null);
        }
    }

    /**
     * Publishes to the outbox in the same transaction as the payment status
     * write above — this used to be a pair of best-effort Feign calls
     * directly into order-service and delivery-service (logged and
     * swallowed on failure, the project's biggest documented gap against
     * the plan). Now payment-service doesn't know either of those services
     * exists; order-service and delivery-service each consume
     * PAYMENT_SUCCEEDED independently and idempotently.
     */
    private void onPaymentSucceeded(Payment payment) {
        outboxRecorder.record(payment.getOrderId().toString(), "PAYMENT_SUCCEEDED", Map.of(
                "orderId", payment.getOrderId().toString(), "userId", payment.getUserId().toString(), "amount", payment.getAmount().toString()
        ));
    }

    private void onPaymentFailed(Payment payment, String reason) {
        outboxRecorder.record(payment.getOrderId().toString(), "PAYMENT_FAILED", Map.of(
                "orderId", payment.getOrderId().toString(),
                "userId", payment.getUserId().toString(),
                "amount", payment.getAmount().toString(),
                "reason", reason == null ? "" : reason
        ));
    }
}
