package com.spicyeat.payment.provider;

import com.spicyeat.common.error.ApiException;
import com.spicyeat.payment.domain.PaymentStatus;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Charges are created server-side as a Stripe PaymentIntent and confirmed
 * client-side with Stripe.js using the returned clientSecret — the server
 * never sees raw card data. The outcome of a charge therefore always starts
 * PROCESSING; it only becomes SUCCESS/FAILED once Stripe calls back via the
 * webhook (PaymentController#webhook -> PaymentService#handleWebhook), which
 * is the source of truth. #verify() is a manual fallback that polls Stripe
 * directly, useful in local dev when webhook delivery isn't wired up.
 */
@Component
public class StripePaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentProvider.class);

    private final StripeProperties properties;

    public StripePaymentProvider(StripeProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void logConfigState() {
        if (properties.getSecretKey().isBlank()) {
            log.warn("STRIPE_SECRET_KEY is not set; payment charges will fail until it is configured");
        }
    }

    private RequestOptions requestOptions() {
        return RequestOptions.builder().setApiKey(properties.getSecretKey()).build();
    }

    public ChargeResult charge(UUID paymentId, UUID orderId, BigDecimal amount, String idempotencyKey) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(toSmallestUnit(amount))
                    .setCurrency(properties.getCurrency())
                    .putMetadata("paymentId", paymentId.toString())
                    .putMetadata("orderId", orderId.toString())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();
            RequestOptions options = RequestOptions.builder()
                    .setApiKey(properties.getSecretKey())
                    .setIdempotencyKey(idempotencyKey)
                    .build();
            PaymentIntent intent = PaymentIntent.create(params, options);
            return new ChargeResult(mapStatus(intent.getStatus()), intent.getId(), null, intent.getClientSecret());
        } catch (StripeException e) {
            log.error("Stripe PaymentIntent creation failed for payment {}", paymentId, e);
            throw ApiException.badRequest("Payment provider error: " + e.getMessage());
        }
    }

    /** Polls Stripe directly for the current status of a PaymentIntent, bypassing the webhook. */
    public ChargeResult verify(String providerReference, PaymentStatus currentStatus) {
        if (providerReference == null) {
            return new ChargeResult(currentStatus, null, null, null);
        }
        try {
            PaymentIntent intent = PaymentIntent.retrieve(providerReference, requestOptions());
            return new ChargeResult(mapStatus(intent.getStatus()), intent.getId(), null, null);
        } catch (StripeException e) {
            log.error("Stripe PaymentIntent lookup failed for {}", providerReference, e);
            return new ChargeResult(currentStatus, providerReference, null, null);
        }
    }

    public RefundResult refund(String providerReference, BigDecimal amount) {
        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(providerReference)
                    .setAmount(toSmallestUnit(amount))
                    .build();
            Refund refund = Refund.create(params, requestOptions());
            PaymentStatus status = "succeeded".equals(refund.getStatus()) ? PaymentStatus.SUCCESS : PaymentStatus.PROCESSING;
            return new RefundResult(status, refund.getId());
        } catch (StripeException e) {
            log.error("Stripe refund failed for {}", providerReference, e);
            throw ApiException.badRequest("Refund provider error: " + e.getMessage());
        }
    }

    private static long toSmallestUnit(BigDecimal amount) {
        return amount.movePointRight(2).longValueExact();
    }

    private static PaymentStatus mapStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "succeeded" -> PaymentStatus.SUCCESS;
            case "canceled" -> PaymentStatus.FAILED;
            case "requires_payment_method", "requires_confirmation", "requires_action",
                 "processing", "requires_capture" -> PaymentStatus.PROCESSING;
            default -> PaymentStatus.PROCESSING;
        };
    }

    public record ChargeResult(PaymentStatus status, String providerReference, String failureReason, String clientSecret) {
    }

    public record RefundResult(PaymentStatus status, String providerReference) {
    }
}
