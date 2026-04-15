package com.smartcampus.dto;

import com.smartcampus.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRoleRequestDto {

    @NotNull(message = "Requested role is required")
    private Role requestedRole;

    @NotBlank(message = "Justification is required")
    @Size(min = 20, max = 500,
          message = "Justification must be between 20 and 500 characters")
    private String justification;
    
}
