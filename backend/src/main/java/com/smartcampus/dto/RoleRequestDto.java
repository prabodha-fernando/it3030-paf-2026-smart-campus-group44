package com.smartcampus.dto;

import com.smartcampus.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RoleRequestDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userDisplayName;
    private Role currentRole;
    private Role requestedRole;
    private String justification;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    
}
