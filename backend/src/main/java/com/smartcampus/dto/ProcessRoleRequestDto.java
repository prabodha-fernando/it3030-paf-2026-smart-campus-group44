package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ProcessRoleRequestDto {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "APPROVED|REJECTED",
             message = "Status must be APPROVED or REJECTED")
    private String status;

    private String adminNote;
    
}
