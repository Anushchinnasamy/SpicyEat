package com.spicyeat.auth.client;

import java.util.Map;
import java.util.UUID;

public record SendNotificationRequest(String type, UUID userId, Map<String, String> data) {
}
