package com.spicyeat.auth.web.dto;

import com.spicyeat.common.security.Role;

import java.util.UUID;

/** Internal-only view of a credential, keyed by id rather than the caller's own JWT — see /api/auth/internal/users/{id}. */
public record UserView(UUID id, String email, Role role) {
}
