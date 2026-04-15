package com.smartcampus.controller;

import com.smartcampus.dto.AuthMeResponse;
import com.smartcampus.dto.LogoutRequest;
import com.smartcampus.dto.TokenRefreshRequest;
import com.smartcampus.dto.TokenRefreshResponse;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthMeResponse> getMe() {
        return ResponseEntity.ok(authService.getCurrentUserSummary());
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refresh(
            @Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(
                authService.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout(
            @Valid @RequestBody LogoutRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    
}
