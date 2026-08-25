package com.spicyeat.notification.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * Thin wrapper over Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * No SDK dependency needed — it's a single POST with a bearer token.
 */
@Component
public class ResendEmailClient {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailClient.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String fromAddress;

    public ResendEmailClient(
            @Value("${spicyeat.resend.api-key}") String apiKey,
            @Value("${spicyeat.resend.from-address}") String fromAddress,
            @Value("${spicyeat.resend.base-url}") String baseUrl
    ) {
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public SendResult send(String to, String subject, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY is not configured; skipping actual send to {}", to);
            return SendResult.failure("RESEND_API_KEY is not configured");
        }
        try {
            ResendResponse response = restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(Map.of("from", fromAddress, "to", List.of(to), "subject", subject, "html", html))
                    .retrieve()
                    .body(ResendResponse.class);
            return SendResult.success(response == null ? null : response.id());
        } catch (RestClientResponseException e) {
            log.error("Resend API call failed with status {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return SendResult.failure("Resend API returned " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Resend API call failed", e);
            return SendResult.failure(e.getMessage());
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ResendResponse(String id) {
    }

    public record SendResult(boolean success, String messageId, String failureReason) {
        static SendResult success(String messageId) {
            return new SendResult(true, messageId, null);
        }

        static SendResult failure(String reason) {
            return new SendResult(false, null, reason);
        }
    }
}
