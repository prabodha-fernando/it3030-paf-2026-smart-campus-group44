package com.smartcampus.service;

import com.smartcampus.config.JwtService;
import com.smartcampus.config.UserPrincipal;
import com.smartcampus.dto.AuthMeResponse;
import com.smartcampus.dto.TokenRefreshResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthMeResponse getCurrentUserSummary() {
        User user = getCurrentUser();
        return AuthMeResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .photoUrl(user.getPhotoUrl())
                .firstLogin(user.isFirstLogin())
                .build();
    }

    @Transactional
    public TokenRefreshResponse refreshToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invalid refresh token"));

        if (!jwtService.isTokenValid(refreshToken)) {
            throw new ResourceNotFoundException("Refresh token has expired");
        }

        String newAccessToken  = jwtService.generateAccessToken(
                user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return new TokenRefreshResponse(newAccessToken, newRefreshToken, "Bearer");
    }

    @Transactional
    public void logout(String refreshToken) {
        userRepository.findByRefreshToken(refreshToken).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    public String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getEmail();
        }
        return auth != null ? auth.getName() : null;
    }

    public User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Authenticated user not found"));
    }
    
}
