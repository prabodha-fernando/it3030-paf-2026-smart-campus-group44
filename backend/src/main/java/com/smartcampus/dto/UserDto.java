package com.smartcampus.dto;

import com.smartcampus.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String displayName;
    private String department;
    private String phone;
    private String photoUrl;
    private Role role;
    private boolean firstLogin;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    
}
