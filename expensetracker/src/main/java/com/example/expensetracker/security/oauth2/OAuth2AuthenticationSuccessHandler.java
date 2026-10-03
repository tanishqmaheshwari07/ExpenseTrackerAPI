package com.example.expensetracker.security.oauth2;

import com.example.expensetracker.config.OAuth2Properties;
import com.example.expensetracker.entity.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2Properties oAuth2Properties;
    private final OAuth2ExchangeCodeService exchangeCodeService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        if (authentication.getPrincipal() instanceof CustomOAuth2User customOAuth2User) {
            User user = customOAuth2User.getUser();

            if (!user.isActive()) {
                log.warn("OAuth login rejected: Account is disabled for email '{}'", user.getEmail());
                String redirectUrl = UriComponentsBuilder
                        .fromUriString(oAuth2Properties.getFailureRedirectUri())
                        .queryParam("error", "account_disabled")
                        .build()
                        .toUriString();
                response.sendRedirect(redirectUrl);
                return;
            }

            // Generate short-lived single-use exchange code (DO NOT put JWT in URL)
            String exchangeCode = exchangeCodeService.createExchangeCode(user.getId(), user.getEmail());

            String targetUrl = UriComponentsBuilder
                    .fromUriString(oAuth2Properties.getAuthorizedRedirectUri())
                    .queryParam("code", exchangeCode)
                    .build()
                    .toUriString();

            log.info("OAuth2 authentication successful for user '{}'. Redirecting with one-time exchange code.", user.getEmail());
            response.sendRedirect(targetUrl);
        } else {
            log.error("Unexpected principal type in OAuth2 authentication success: {}", authentication.getPrincipal().getClass());
            response.sendRedirect(oAuth2Properties.getFailureRedirectUri());
        }
    }
}
