package com.spicyeat.gateway.filter;

import com.spicyeat.gateway.security.JwtValidator;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Validates the caller's JWT (when required) and attaches the trusted
 * identity as X-User-Id / X-User-Roles headers for downstream services.
 * Any client-supplied values for those headers are stripped first so callers
 * cannot spoof identity by setting them directly.
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    public static final String USER_ID_HEADER = "X-User-Id";
    public static final String USER_ROLES_HEADER = "X-User-Roles";

    private static final List<PublicRoute> PUBLIC_ROUTES = List.of(
            new PublicRoute(HttpMethod.POST, Pattern.compile("^/api/auth/register$")),
            new PublicRoute(HttpMethod.POST, Pattern.compile("^/api/auth/login$")),
            new PublicRoute(HttpMethod.POST, Pattern.compile("^/api/auth/refresh$")),
            new PublicRoute(HttpMethod.POST, Pattern.compile("^/api/auth/forgot-password$")),
            new PublicRoute(HttpMethod.POST, Pattern.compile("^/api/auth/reset-password$")),
            new PublicRoute(HttpMethod.GET, Pattern.compile("^/api/menu(/.*)?$")),
            new PublicRoute(HttpMethod.POST, Pattern.compile("^/api/payments/webhook$")),
            new PublicRoute(HttpMethod.GET, Pattern.compile("^/actuator/health$"))
    );

    private final JwtValidator jwtValidator;

    public JwtAuthenticationFilter(JwtValidator jwtValidator) {
        this.jwtValidator = jwtValidator;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        ServerHttpRequest.Builder sanitized = request.mutate()
                .headers(headers -> {
                    headers.remove(USER_ID_HEADER);
                    headers.remove(USER_ROLES_HEADER);
                });

        if (isPublic(request)) {
            return chain.filter(exchange.mutate().request(sanitized.build()).build());
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing bearer token");
        }

        String token = authHeader.substring("Bearer ".length());
        Optional<JwtValidator.ValidatedToken> validated = jwtValidator.validate(token);
        if (validated.isEmpty()) {
            return unauthorized(exchange, "Invalid or expired token");
        }

        JwtValidator.ValidatedToken claims = validated.get();
        ServerHttpRequest mutated = sanitized
                .header(USER_ID_HEADER, claims.userId())
                .header(USER_ROLES_HEADER, String.join(",", claims.roles()))
                .build();

        return chain.filter(exchange.mutate().request(mutated).build());
    }

    private boolean isPublic(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();
        return PUBLIC_ROUTES.stream()
                .anyMatch(route -> route.method.equals(method) && route.pattern.matcher(path).matches());
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        String body = """
                {"status":401,"code":"UNAUTHORIZED","message":"%s"}""".formatted(message);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8))));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }

    private record PublicRoute(HttpMethod method, Pattern pattern) {
    }
}
