package com.spicyeat.auth.security;

import com.spicyeat.auth.domain.RefreshToken;
import com.spicyeat.auth.repository.RefreshTokenRepository;
import com.spicyeat.common.error.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Refresh tokens are opaque, random, and rotated on every use. Only their
 * SHA-256 hash is persisted so a leaked database backup cannot be replayed
 * as a live session.
 */
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final Duration refreshTokenTtl;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${spicyeat.jwt.refresh-token-ttl-days}") long refreshTokenTtlDays
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenTtl = Duration.ofDays(refreshTokenTtlDays);
    }

    public String issue(UUID userId) {
        String rawToken = UUID.randomUUID() + "." + UUID.randomUUID();
        RefreshToken entity = new RefreshToken(userId, TokenHasher.hash(rawToken), Instant.now().plus(refreshTokenTtl));
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    public RefreshToken consume(String rawToken) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(TokenHasher.hash(rawToken))
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));
        if (!token.isValid()) {
            throw ApiException.unauthorized("Refresh token expired or revoked");
        }
        token.revoke();
        refreshTokenRepository.save(token);
        return token;
    }

    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(TokenHasher.hash(rawToken)).ifPresent(token -> {
            token.revoke();
            refreshTokenRepository.save(token);
        });
    }

    /** Called on password reset: a stolen refresh token must not survive the owner regaining control. */
    public void revokeAllForUser(UUID userId) {
        refreshTokenRepository.revokeAllForUser(userId);
    }
}
