package com.smartcampus.config;

import com.smartcampus.enums.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

            String email    = oauth2User.getAttribute("email");
            String name     = oauth2User.getAttribute("name");
            String photoUrl = oauth2User.getAttribute("picture");
            String googleId = oauth2User.getAttribute("sub");

            if (email == null || email.isBlank()) {
                log.warn("OAuth2 user email is null or blank");
                redirectToError(request, response, "invalid_email");
                return;
            }

            boolean domainAllowed = appProperties.getAllowedEmailDomains()
                    .stream()
                    .anyMatch(email::endsWith);

            if (!domainAllowed) {
                log.warn("OAuth2 email domain not allowed: {}", email);
                redirectToError(request, response, "domain_not_allowed");
                return;
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                user = User.builder()
                        .email(email)
                        .displayName(name)
                        .photoUrl(photoUrl)
                        .googleId(googleId)
                        .role(Role.USER)
                        .firstLogin(true)
                        .build();
                log.info("Creating new user for OAuth2: {}", email);
            } else {
                log.info("Updating existing user for OAuth2: {}", email);
                user.setPhotoUrl(photoUrl);
                user.setGoogleId(googleId);
                if (user.getDisplayName() == null) {
                    user.setDisplayName(name);
                }
            }

            user.setLastLoginAt(LocalDateTime.now());

            String accessToken  = jwtService.generateAccessToken(email,
                    user.getRole().name());
            String refreshToken = jwtService.generateRefreshToken(email);
            user.setRefreshToken(refreshToken);

            userRepository.save(user);
            log.info("User saved successfully for OAuth2: {}", email);

            boolean firstLogin = user.isFirstLogin();

            String redirectUrl = appProperties.getFrontendUrl()
                    + "/auth/callback"
                    + "?token="        + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                    + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
                    + "&firstLogin="   + firstLogin;

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } catch (IOException e) {
            log.error("IO error during OAuth2 success handling", e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during OAuth2 success handling", e);
            try {
                redirectToError(request, response, "auth_error");
            } catch (IOException ioException) {
                log.error("Failed to redirect to error page", ioException);
            }
        }
    }

    private void redirectToError(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  String errorCode) throws IOException {
        String errorUrl = appProperties.getFrontendUrl()
                + "/login?error=" + errorCode;
        getRedirectStrategy().sendRedirect(request, response, errorUrl);
    }
    
}
