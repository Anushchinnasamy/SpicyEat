package com.spicyeat.auth.security;

import com.spicyeat.auth.domain.PasswordResetToken;
import com.spicyeat.auth.repository.PasswordResetTokenRepository;
import com.spicyeat.common.error.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final Duration tokenTtl;

    public PasswordResetService(
            PasswordResetTokenRepository passwordResetTokenRepository,
            @Value("${spicyeat.jwt.password-reset-ttl-minutes}") long tokenTtlMinutes
    ) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.tokenTtl = Duration.ofMinutes(tokenTtlMinutes);
    }

    public String issue(UUID userId) {
        String rawToken = UUID.randomUUID() + "." + UUID.randomUUID();
        PasswordResetToken entity = new PasswordResetToken(userId, TokenHasher.hash(rawToken), Instant.now().plus(tokenTtl));
        passwordResetTokenRepository.save(entity);
        return rawToken;
    }

    /** Consuming marks the token used immediately, before the caller updates the password, so a retry can't reuse it. */
    public PasswordResetToken consume(String rawToken) {
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(TokenHasher.hash(rawToken))
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired reset link"));
        if (!token.isValid()) {
            throw ApiException.badRequest("Invalid or expired reset link");
        }
        token.markUsed();
        passwordResetTokenRepository.save(token);
        return token;
    }
}
