package com.spicyeat.common.feign;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;

/**
 * Not annotated with @Configuration on purpose: Feign instantiates
 * per-client configuration classes in an isolated child context, so this
 * must not be picked up by the application's own component scan.
 */
public class ForwardedHeadersFeignConfig {

    @Bean
    public RequestInterceptor forwardedHeadersInterceptor() {
        return new ForwardedHeadersInterceptor();
    }
}
