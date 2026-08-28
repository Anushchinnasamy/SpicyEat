package com.spicyeat.auth.web.dto;

import com.spicyeat.auth.domain.AccountStatus;
import com.spicyeat.auth.domain.UserCredential;
import com.spicyeat.common.security.Role;

import java.time.Instant;
import java.util.UUID;

public record UserSummaryResponse(UUID id, String email, Role role, AccountStatus status, Instant createdAt) {
    public static UserSummaryResponse from(UserCredential credential) {
        return new UserSummaryResponse(
                credential.getId(), credential.getEmail(), credential.getRole(),
                credential.getStatus(), credential.getCreatedAt()
        );
    }
}
