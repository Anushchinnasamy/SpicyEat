package com.spicyeat.auth.web.dto;

import com.spicyeat.common.security.Role;

import java.util.UUID;

public record MeResponse(UUID id, String email, Role role) {
}
