package com.spicyeat.common.feign;

import com.spicyeat.common.error.Headers;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Propagates the caller's trusted identity and correlation id onto outgoing
 * Feign calls, so a downstream service sees the same X-User-Id / X-User-Roles
 * the gateway attached to the original inbound request.
 */
public class ForwardedHeadersInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        HttpServletRequest inbound = currentRequest();
        if (inbound == null) {
            return;
        }
        forward(template, inbound, Headers.USER_ID);
        forward(template, inbound, Headers.USER_ROLES);
        forward(template, inbound, Headers.CORRELATION_ID);
    }

    private void forward(RequestTemplate template, HttpServletRequest inbound, String header) {
        String value = inbound.getHeader(header);
        if (value != null && !value.isBlank()) {
            template.header(header, value);
        }
    }

    private HttpServletRequest currentRequest() {
        var attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            return servletAttributes.getRequest();
        }
        return null;
    }
}
