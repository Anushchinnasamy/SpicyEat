package com.spicyeat.payment.provider;

import com.spicyeat.payment.domain.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Stands in for a real payment gateway (Stripe/Razorpay/etc.). The important
 * property it preserves is architectural, not the specific rules: the
 * *server* decides whether a charge succeeded by asking this component, never
 * by trusting anything the client claims. Swap this out for a real SDK call
 * without touching PaymentService's control flow.
 *
 * Two amounts are reserved to make the failure and async-settlement paths
 * deterministically testable instead of relying on randomness:
 * - 13.13 -> the provider declines the charge (FAILED)
 * - 99.99 -> the provider defers the decision (PROCESSING); a later
 *   verify() call resolves it to SUCCESS, simulating an async settlement
 *   that a real integration would learn about via polling or a webhook.
 */
@Component
public class MockPaymentProvider {

    private static final BigDecimal DECLINED_AMOUNT = new BigDecimal("13.13");
    private static final BigDecimal DEFERRED_AMOUNT = new BigDecimal("99.99");

    public ChargeResult charge(BigDecimal amount) {
        String reference = "mock_ch_" + UUID.randomUUID();
        if (amount.compareTo(DECLINED_AMOUNT) == 0) {
            return new ChargeResult(PaymentStatus.FAILED, reference, "Card declined by issuer");
        }
        if (amount.compareTo(DEFERRED_AMOUNT) == 0) {
            return new ChargeResult(PaymentStatus.PROCESSING, reference, null);
        }
        return new ChargeResult(PaymentStatus.SUCCESS, reference, null);
    }

    /** A real integration would ask the provider for the current status of providerReference. */
    public ChargeResult verify(String providerReference, PaymentStatus currentStatus) {
        if (currentStatus == PaymentStatus.PROCESSING) {
            return new ChargeResult(PaymentStatus.SUCCESS, providerReference, null);
        }
        return new ChargeResult(currentStatus, providerReference, null);
    }

    public RefundResult refund(BigDecimal amount) {
        return new RefundResult(PaymentStatus.SUCCESS, "mock_rf_" + UUID.randomUUID());
    }

    public record ChargeResult(PaymentStatus status, String providerReference, String failureReason) {
    }

    public record RefundResult(PaymentStatus status, String providerReference) {
    }
}
