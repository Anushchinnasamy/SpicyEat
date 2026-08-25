package com.spicyeat.common.error;

/**
 * Header names set by the API Gateway after JWT validation and trusted by
 * downstream services. Services should never accept these headers directly
 * from the public internet; only the gateway is expected to be public.
 */
public final class Headers {

    public static final String USER_ID = "X-User-Id";
    public static final String USER_ROLES = "X-User-Roles";
    public static final String CORRELATION_ID = "X-Correlation-Id";

    private Headers() {
    }
}
