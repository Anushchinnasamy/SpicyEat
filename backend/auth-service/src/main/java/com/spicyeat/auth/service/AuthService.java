package com.spicyeat.auth.service;

import com.spicyeat.auth.client.NotificationServiceClient;
import com.spicyeat.auth.client.SendNotificationRequest;
import com.spicyeat.auth.domain.AccountStatus;
import com.spicyeat.auth.domain.PasswordResetToken;
import com.spicyeat.auth.domain.RefreshToken;
import com.spicyeat.auth.domain.UserCredential;
import com.spicyeat.auth.repository.UserCredentialRepository;
import com.spicyeat.auth.security.JwtService;
import com.spicyeat.auth.security.PasswordResetService;
import com.spicyeat.auth.security.RefreshTokenService;
import com.spicyeat.auth.web.dto.AuthResponse;
import com.spicyeat.auth.web.dto.MeResponse;
import com.spicyeat.auth.web.dto.UserSummaryResponse;
import com.spicyeat.auth.web.dto.UserView;
import com.spicyeat.common.error.ApiException;
import com.spicyeat.common.security.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final NotificationServiceClient notificationServiceClient;
    private final String resetPasswordUrlBase;

    public AuthService(
            UserCredentialRepository userCredentialRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            PasswordResetService passwordResetService,
            NotificationServiceClient notificationServiceClient,
            @Value("${spicyeat.frontend.reset-password-url}") String resetPasswordUrlBase
    ) {
        this.userCredentialRepository = userCredentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
        this.notificationServiceClient = notificationServiceClient;
        this.resetPasswordUrlBase = resetPasswordUrlBase;
    }

    @Transactional
    public AuthResponse register(String email, String rawPassword, Role requestedRole) {
        if (userCredentialRepository.existsByEmail(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }
        Role role = requestedRole == null ? Role.CUSTOMER : requestedRole;
        UserCredential credential = new UserCredential(email, passwordEncoder.encode(rawPassword), role);
        userCredentialRepository.save(credential);
        return issueTokens(credential);
    }

    @Transactional
    public AuthResponse login(String email, String rawPassword) {
        UserCredential credential = userCredentialRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (credential.getStatus() != AccountStatus.ACTIVE) {
            throw ApiException.forbidden("Account is disabled");
        }
        if (!passwordEncoder.matches(rawPassword, credential.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        return issueTokens(credential);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken consumed = refreshTokenService.consume(rawRefreshToken);
        UserCredential credential = userCredentialRepository.findById(consumed.getUserId())
                .orElseThrow(() -> ApiException.unauthorized("Account no longer exists"));
        return issueTokens(credential);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    @Transactional(readOnly = true)
    public MeResponse me(UUID userId) {
        UserCredential credential = userCredentialRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Account not found"));
        return new MeResponse(credential.getId(), credential.getEmail(), credential.getRole());
    }

    @Transactional(readOnly = true)
    public UserView getUserView(UUID userId) {
        UserCredential credential = userCredentialRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Account not found"));
        return new UserView(credential.getId(), credential.getEmail(), credential.getRole());
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> listUsers() {
        return userCredentialRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(UserSummaryResponse::from)
                .toList();
    }

    /**
     * Always succeeds from the caller's point of view, whether or not the
     * email is registered — telling the caller "no such account" would let
     * anyone enumerate registered emails through this endpoint.
     */
    @Transactional
    public void requestPasswordReset(String email) {
        userCredentialRepository.findByEmail(email).ifPresent(credential -> {
            String rawToken = passwordResetService.issue(credential.getId());
            String resetLink = resetPasswordUrlBase + "?token=" + rawToken;
            try {
                notificationServiceClient.send(new SendNotificationRequest(
                        "PASSWORD_RESET", credential.getId(), Map.of("resetLink", resetLink)
                ));
            } catch (Exception e) {
                log.error("Failed to send password reset notification for user {}", credential.getId(), e);
            }
        });
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = passwordResetService.consume(rawToken);
        UserCredential credential = userCredentialRepository.findById(token.getUserId())
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired reset link"));
        credential.setPasswordHash(passwordEncoder.encode(newPassword));
        userCredentialRepository.save(credential);
        refreshTokenService.revokeAllForUser(credential.getId());
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        UserCredential credential = userCredentialRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Missing authenticated user context"));
        if (!passwordEncoder.matches(currentPassword, credential.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        credential.setPasswordHash(passwordEncoder.encode(newPassword));
        userCredentialRepository.save(credential);
        refreshTokenService.revokeAllForUser(credential.getId());
    }

    private AuthResponse issueTokens(UserCredential credential) {
        String accessToken = jwtService.issueAccessToken(credential.getId(), credential.getRole());
        String refreshToken = refreshTokenService.issue(credential.getId());
        return AuthResponse.of(accessToken, refreshToken, jwtService.accessTokenTtlSeconds());
    }
}
