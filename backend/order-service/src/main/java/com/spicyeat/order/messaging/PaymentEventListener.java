package com.spicyeat.order.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spicyeat.common.error.ApiException;
import com.spicyeat.order.domain.OrderStatus;
import com.spicyeat.order.domain.ProcessedEvent;
import com.spicyeat.order.repository.ProcessedEventRepository;
import com.spicyeat.order.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Replaces payment-service's old direct Feign call into order-service
 * (POST /{id}/status) — payment-service no longer knows order-service
 * exists. It just publishes PAYMENT_SUCCEEDED; this is the sole place that
 * reacts to it on the order side.
 */
@Component
public class PaymentEventListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventListener.class);

    private final ObjectMapper objectMapper;
    private final OrderService orderService;
    private final ProcessedEventRepository processedEventRepository;

    public PaymentEventListener(ObjectMapper objectMapper, OrderService orderService, ProcessedEventRepository processedEventRepository) {
        this.objectMapper = objectMapper;
        this.orderService = orderService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = "${spicyeat.kafka.payment-topic}", groupId = "order-service")
    @Transactional
    public void onPaymentEvent(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            String eventId = node.path("eventId").asText();
            String eventType = node.path("eventType").asText();

            if (!"PAYMENT_SUCCEEDED".equals(eventType)) {
                return;
            }
            if (processedEventRepository.existsByEventId(eventId)) {
                log.info("Ignoring already-processed event {}", eventId);
                return;
            }

            UUID orderId = UUID.fromString(node.path("payload").path("orderId").asText());
            try {
                orderService.advanceStatus(orderId, OrderStatus.CONFIRMED);
            } catch (ApiException e) {
                log.warn("Could not advance order {} to CONFIRMED from PAYMENT_SUCCEEDED event {}: {}", orderId, eventId, e.getMessage());
            }
            processedEventRepository.save(new ProcessedEvent(eventId));
        } catch (Exception e) {
            log.error("Failed to process payment event message: {}", message, e);
        }
    }
}
