package com.example.expensetracker.security.oauth2;

import com.example.expensetracker.config.OAuth2Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2ExchangeCodeService {

    private final OAuth2Properties oAuth2Properties;
    private final SecureRandom secureRandom = new SecureRandom();

    private record ExchangeCodeEntry(Long userId, String email, Instant expiresAt) {
        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private final Map<String, ExchangeCodeEntry> codeStore = new ConcurrentHashMap<>();

    /**
     * Generates a cryptographically random, short-lived, single-use exchange code for an authenticated user.
     */
    public String createExchangeCode(Long userId, String email) {
        // Cleanup expired codes periodically
        cleanupExpiredCodes();

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String code = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        Instant expiresAt = Instant.now().plusSeconds(oAuth2Properties.getExchangeCodeExpirationSeconds());
        codeStore.put(code, new ExchangeCodeEntry(userId, email, expiresAt));

        log.debug("Created one-time OAuth exchange code for user ID: {}, expires at: {}", userId, expiresAt);
        return code;
    }

    /**
     * Atomically validates and consumes a one-time exchange code.
     * Returns the user email if valid and not expired; returns Optional.empty() if invalid, expired, or already used.
     */
    public Optional<Long> consumeExchangeCode(String code) {
        if (code == null || code.isBlank()) {
            return Optional.empty();
        }

        // Atomically remove the entry so it cannot be consumed more than once
        ExchangeCodeEntry entry = codeStore.remove(code.trim());
        if (entry == null) {
            log.warn("OAuth exchange code not found or already consumed");
            return Optional.empty();
        }

        if (entry.isExpired()) {
            log.warn("OAuth exchange code for user ID {} has expired", entry.userId());
            return Optional.empty();
        }

        log.info("Successfully consumed one-time OAuth exchange code for user ID: {}", entry.userId());
        return Optional.of(entry.userId());
    }

    private void cleanupExpiredCodes() {
        codeStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
