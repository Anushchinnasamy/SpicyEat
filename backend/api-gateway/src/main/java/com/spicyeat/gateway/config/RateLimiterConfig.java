package com.spicyeat.gateway.config;

import com.spicyeat.gateway.filter.JwtAuthenticationFilter;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    /**
     * Rate limit per authenticated user when we know who they are (the
     * gateway already validated their JWT by the time filters run), falling
     * back to remote address for anonymous requests (login/register) —
     * otherwise every unauthenticated caller behind the same NAT would share
     * one bucket.
     */
    @Bean
    public KeyResolver rateLimiterKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst(JwtAuthenticationFilter.USER_ID_HEADER);
            if (userId != null && !userId.isBlank()) {
                return Mono.just(userId);
            }
            var remoteAddress = exchange.getRequest().getRemoteAddress();
            return Mono.just(remoteAddress == null ? "unknown" : remoteAddress.getAddress().getHostAddress());
        };
    }
}
