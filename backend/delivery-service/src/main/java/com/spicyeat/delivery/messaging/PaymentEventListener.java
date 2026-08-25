package com.spicyeat.delivery.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spicyeat.delivery.domain.ProcessedEvent;
import com.spicyeat.delivery.repository.ProcessedEventRepository;
import com.spicyeat.delivery.service.DeliveryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Replaces payment-service's old direct Feign call into delivery-service
 * (POST /api/delivery). createForOrder() is already naturally idempotent
 * by orderId, but the eventId dedup here is the defense-in-depth layer the
 * plan asks every Kafka consumer to have.
 */
@Component
public class PaymentEventListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventListener.class);

    private final ObjectMapper objectMapper;
    private final DeliveryService deliveryService;
    private final ProcessedEventRepository processedEventRepository;

    public PaymentEventListener(ObjectMapper objectMapper, DeliveryService deliveryService, ProcessedEventRepository processedEventRepository) {
        this.objectMapper = objectMapper;
        this.deliveryService = deliveryService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = "${spicyeat.kafka.payment-topic}", groupId = "delivery-service")
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
            deliveryService.createForOrder(orderId);
            processedEventRepository.save(new ProcessedEvent(eventId));
        } catch (Exception e) {
            log.error("Failed to process payment event message: {}", message, e);
        }
    }
}
