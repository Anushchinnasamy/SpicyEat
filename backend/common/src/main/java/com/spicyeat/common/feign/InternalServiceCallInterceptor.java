package com.spicyeat.common.feign;

import com.spicyeat.common.error.Headers;
import com.spicyeat.common.security.Role;
import feign.RequestInterceptor;
import feign.RequestTemplate;

/**
 * Asserts a synthetic, trusted "system" identity on outgoing Feign calls that
 * are not triggered by any inbound HTTP request — e.g. payment-service
 * reacting to its own successful charge by advancing an order's status.
 *
 * This only works because these calls stay on the private service network
 * and never cross the gateway (the gateway is the sole component reachable
 * from the public internet, per plan section 5). A target endpoint that
 * accepts this header still enforces its normal role check
 * (CurrentUser.requireRole(..., ADMIN)); this interceptor just asserts the
 * caller is one of "our own backend services", not a real admin user.
 */
public class InternalServiceCallInterceptor implements RequestInterceptor {

    /** Nil UUID: there is no real end user behind this call. */
    private static final String SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";

    @Override
    public void apply(RequestTemplate template) {
        template.header(Headers.USER_ID, SYSTEM_USER_ID);
        template.header(Headers.USER_ROLES, Role.ADMIN.name());
    }
}
