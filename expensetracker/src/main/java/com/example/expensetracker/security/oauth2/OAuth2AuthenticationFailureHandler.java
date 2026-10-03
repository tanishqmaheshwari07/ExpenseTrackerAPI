package com.example.expensetracker.security.oauth2;

import com.example.expensetracker.config.OAuth2Properties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private final OAuth2Properties oAuth2Properties;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {

        String errorCode = "oauth_failed";

        if (exception instanceof OAuth2AuthenticationException oAuth2Exception) {
            String oAuth2ErrorCode = oAuth2Exception.getError().getErrorCode();
            if ("account_conflict".equalsIgnoreCase(oAuth2ErrorCode)) {
                errorCode = "account_conflict";
            } else if ("invalid_email".equalsIgnoreCase(oAuth2ErrorCode)) {
                errorCode = "invalid_email";
            }
        }

        log.warn("OAuth2 authentication failure: {} (Error code mapped to: {})", exception.getMessage(), errorCode);

        String targetUrl = UriComponentsBuilder
                .fromUriString(oAuth2Properties.getFailureRedirectUri())
                .replaceQueryParam("error", errorCode)
                .build()
                .toUriString();

        response.sendRedirect(targetUrl);
    }
}
