package com.spicyeat.common.security;

import com.spicyeat.common.error.Headers;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Reads the identity that the API Gateway attached to the request after
 * validating the caller's JWT. Downstream services trust these headers only
 * because the gateway is the sole public entry point.
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static UUID userId(HttpServletRequest request) {
        String header = request.getHeader(Headers.USER_ID);
        if (header == null || header.isBlank()) {
            throw com.spicyeat.common.error.ApiException.unauthorized("Missing authenticated user context");
        }
        return UUID.fromString(header);
    }

    public static List<String> roles(HttpServletRequest request) {
        String header = request.getHeader(Headers.USER_ROLES);
        if (header == null || header.isBlank()) {
            return List.of();
        }
        return Arrays.asList(header.split(","));
    }

    public static boolean hasRole(HttpServletRequest request, Role role) {
        return roles(request).contains(role.name());
    }

    public static void requireRole(HttpServletRequest request, Role role) {
        if (!hasRole(request, role)) {
            throw com.spicyeat.common.error.ApiException.forbidden("Requires role " + role.name());
        }
    }
}
