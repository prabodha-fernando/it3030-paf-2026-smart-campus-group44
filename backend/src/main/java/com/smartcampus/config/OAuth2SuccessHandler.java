package com.smartcampus.config;

import com.smartcampus.enums.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

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

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email    = oauth2User.getAttribute("email");
        String name     = oauth2User.getAttribute("name");
        String photoUrl = oauth2User.getAttribute("picture");
        String googleId = oauth2User.getAttribute("sub");

        boolean domainAllowed = appProperties.getAllowedEmailDomains()
                .stream()
                .anyMatch(domain -> email != null && email.endsWith(domain));

        if (!domainAllowed) {
            getRedirectStrategy().sendRedirect(request, response,
                    appProperties.getFrontendUrl()
                            + "/login?error=domain_not_allowed");
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
        } else {
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

        boolean firstLogin = user.isFirstLogin();

        String redirectUrl = appProperties.getFrontendUrl()
                + "/auth/callback"
                + "?token="        + accessToken
                + "&refreshToken=" + refreshToken
                + "&firstLogin="   + firstLogin;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
    
}

