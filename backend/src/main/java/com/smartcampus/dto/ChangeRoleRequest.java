package com.smartcampus.dto;

import com.smartcampus.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequest {
    
    @NotNull(message = "Role is required")
    private Role role;
    
}
