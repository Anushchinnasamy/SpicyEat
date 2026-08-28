package com.spicyeat.delivery.web.dto;

import com.spicyeat.delivery.domain.DeliveryPartnerProfile;

import java.math.BigDecimal;
import java.util.UUID;

public record PartnerProfileResponse(UUID userId, String vehicle, BigDecimal rating, boolean online) {
    public static PartnerProfileResponse from(DeliveryPartnerProfile profile) {
        return new PartnerProfileResponse(profile.getUserId(), profile.getVehicle(), profile.getRating(), profile.isOnline());
    }
}
