package com.smartcampus.dto;

import com.smartcampus.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthMeResponse {
    private Long id;
    private String email;
    private String displayName;
    private Role role;
    private String photoUrl;
    private boolean firstLogin;
    
}
