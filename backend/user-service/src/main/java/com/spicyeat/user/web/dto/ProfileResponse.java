package com.spicyeat.user.web.dto;

import java.util.UUID;

public record ProfileResponse(UUID userId, String fullName, String phoneNumber) {
}
