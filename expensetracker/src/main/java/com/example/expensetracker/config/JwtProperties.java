package com.example.expensetracker.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "application.security.jwt")
@Getter
@Setter
public class JwtProperties {

    /**
     * Secret key for signing JWT tokens (HMAC-SHA256, minimum 256 bits / 32 chars).
     */
    private String secretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    /**
     * Access token validity in milliseconds (default: 15 minutes).
     */
    private long accessTokenExpirationMs = 15 * 60 * 1000L;

    /**
     * Refresh token validity in milliseconds (default: 7 days).
     */
    private long refreshTokenExpirationMs = 7 * 24 * 60 * 60 * 1000L;
}
