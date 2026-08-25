package com.spicyeat.common.feign;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;

/**
 * Not annotated with @Configuration: Feign instantiates per-client
 * configuration classes in an isolated child context, so this must not be
 * picked up by the application's own component scan.
 */
public class InternalServiceCallFeignConfig {

    @Bean
    public RequestInterceptor internalServiceCallInterceptor() {
        return new InternalServiceCallInterceptor();
    }
}
