package com.spicyeat.notification.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spicyeat.notification.domain.NotificationType;
import com.spicyeat.notification.domain.ProcessedEvent;
import com.spicyeat.notification.repository.ProcessedEventRepository;
import com.spicyeat.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Order-service and payment-service used to call POST /api/notifications
 * directly for these six event types. Now they publish domain events and
 * don't know notification-service exists — this is the sole remaining
 * caller of NotificationService.send() for anything except PASSWORD_RESET,
 * which stays a direct call from auth-service since it isn't really a
 * domain event (see README).
 *
 * eventType strings on the wire ("ORDER_PLACED", "PAYMENT_SUCCEEDED", ...)
 * are deliberately identical to NotificationType enum constants where a
 * notification should fire; NotificationType.valueOf(...) failing is how
 * event types nobody emails for (ORDER_PREPARING, ORDER_CANCELLED, ...)
 * get skipped without a manual mapping table.
 */
@Component
public class DomainEventListener {

    private static final Logger log = LoggerFactory.getLogger(DomainEventListener.class);

    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final ProcessedEventRepository processedEventRepository;

    public DomainEventListener(ObjectMapper objectMapper, NotificationService notificationService, ProcessedEventRepository processedEventRepository) {
        this.objectMapper = objectMapper;
        this.notificationService = notificationService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = "${spicyeat.kafka.order-topic}", groupId = "notification-service")
    @Transactional
    public void onOrderEvent(String message) {
        handle(message);
    }

    @KafkaListener(topics = "${spicyeat.kafka.payment-topic}", groupId = "notification-service")
    @Transactional
    public void onPaymentEvent(String message) {
        handle(message);
    }

    private void handle(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            String eventId = node.path("eventId").asText();
            String eventType = node.path("eventType").asText();

            NotificationType type;
            try {
                type = NotificationType.valueOf(eventType);
            } catch (IllegalArgumentException e) {
                return; // not one of the event types we email for
            }
            if (type == NotificationType.PASSWORD_RESET) {
                return; // that one only ever arrives via the REST endpoint from auth-service
            }
            if (processedEventRepository.existsByEventId(eventId)) {
                log.info("Ignoring already-processed event {}", eventId);
                return;
            }

            JsonNode payloadNode = node.path("payload");
            UUID userId = UUID.fromString(payloadNode.path("userId").asText());
            @SuppressWarnings("unchecked")
            Map<String, String> data = objectMapper.convertValue(payloadNode, Map.class);

            notificationService.send(type, userId, data);
            processedEventRepository.save(new ProcessedEvent(eventId));
        } catch (Exception e) {
            log.error("Failed to process domain event message: {}", message, e);
        }
    }
}
