package com.spicyeat.payment.web;

import com.spicyeat.common.error.ApiException;
import com.spicyeat.common.security.CurrentUser;
import com.spicyeat.common.security.Role;
import com.spicyeat.payment.domain.Payment;
import com.spicyeat.payment.domain.PaymentStatus;
import com.spicyeat.payment.service.PaymentService;
import com.spicyeat.payment.web.dto.CreatePaymentRequest;
import com.spicyeat.payment.web.dto.PaymentResponse;
import com.spicyeat.payment.web.dto.RefundRequest;
import com.spicyeat.payment.web.dto.WebhookRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
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
        Payment payment = paymentService.createPayment(userId, body.orderId(), body.amount(), idempotencyKey);
        return ResponseEntity.status(HttpStatus.CREATED).body(PaymentResponse.from(payment));
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

    /** Simulated payment-provider webhook; not exposed through the gateway's normal customer routes. */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@Valid @RequestBody WebhookRequest body) {
        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(body.status());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Unknown status: " + body.status());
        }
        paymentService.handleWebhook(body.eventId(), body.paymentId(), status, body.providerReference());
        return ResponseEntity.ok().build();
    }
}
