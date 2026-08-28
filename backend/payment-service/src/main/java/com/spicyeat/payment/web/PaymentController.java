package com.spicyeat.payment.web;

import com.spicyeat.common.error.ApiException;
import com.spicyeat.common.security.CurrentUser;
import com.spicyeat.common.security.Role;
import com.spicyeat.payment.domain.Payment;
import com.spicyeat.payment.domain.PaymentStatus;
import com.spicyeat.payment.provider.StripeProperties;
import com.spicyeat.payment.service.PaymentService;
import com.spicyeat.payment.web.dto.CreatePaymentRequest;
import com.spicyeat.payment.web.dto.PaymentResponse;
import com.spicyeat.payment.web.dto.RefundRequest;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final StripeProperties stripeProperties;

    public PaymentController(PaymentService paymentService, StripeProperties stripeProperties) {
        this.paymentService = paymentService;
        this.stripeProperties = stripeProperties;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> create(
            HttpServletRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreatePaymentRequest body
    ) {
        UUID userId = CurrentUser.userId(request);
        if (idempotencyKey.isBlank()) {
            throw ApiException.badRequest("Idempotency-Key header is required");
        }
        PaymentService.PaymentCreationResult result =
                paymentService.createPayment(userId, body.orderId(), body.amount(), idempotencyKey);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PaymentResponse.from(result.payment(), result.clientSecret()));
    }

    @GetMapping("/{id}")
    public PaymentResponse get(HttpServletRequest request, @PathVariable UUID id) {
        UUID userId = CurrentUser.userId(request);
        return PaymentResponse.from(paymentService.getPayment(userId, id));
    }

    @PostMapping("/{id}/verify")
    public PaymentResponse verify(HttpServletRequest request, @PathVariable UUID id) {
        UUID userId = CurrentUser.userId(request);
        return PaymentResponse.from(paymentService.verify(userId, id));
    }

    @PostMapping("/{id}/refund")
    public PaymentResponse refund(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody RefundRequest body) {
        CurrentUser.requireRole(request, Role.ADMIN);
        return PaymentResponse.from(paymentService.refund(id, body.amount(), body.reason()));
    }

    /** Stripe webhook; a public gateway route, so the signature is the only trust boundary. */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signatureHeader
    ) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signatureHeader, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            throw ApiException.badRequest("Invalid Stripe webhook signature");
        }

        StripeObject dataObject = event.getDataObjectDeserializer().getObject().orElse(null);
        if (!(dataObject instanceof PaymentIntent intent)) {
            return ResponseEntity.ok().build(); // event type we don't care about
        }

        String paymentIdRaw = intent.getMetadata().get("paymentId");
        if (paymentIdRaw == null) {
            log.warn("Stripe event {} for PaymentIntent {} has no paymentId metadata; ignoring", event.getId(), intent.getId());
            return ResponseEntity.ok().build();
        }

        PaymentStatus status = switch (event.getType()) {
            case "payment_intent.succeeded" -> PaymentStatus.SUCCESS;
            case "payment_intent.payment_failed", "payment_intent.canceled" -> PaymentStatus.FAILED;
            default -> null;
        };
        if (status == null) {
            return ResponseEntity.ok().build(); // e.g. payment_intent.created, .processing - not a terminal outcome
        }

        paymentService.handleWebhook(event.getId(), UUID.fromString(paymentIdRaw), status, intent.getId());
        return ResponseEntity.ok().build();
    }
}
