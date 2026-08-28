package com.spicyeat.delivery.web.dto;

import com.spicyeat.delivery.domain.DeliveryPartnerProfile;

import java.math.BigDecimal;
import java.util.UUID;

public record AdminPartnerResponse(UUID userId, String vehicle, BigDecimal rating, boolean online, long completedDeliveries) {
    public static AdminPartnerResponse from(DeliveryPartnerProfile profile, long completedDeliveries) {
        return new AdminPartnerResponse(
                profile.getUserId(), profile.getVehicle(), profile.getRating(), profile.isOnline(), completedDeliveries
        );
    }
}
