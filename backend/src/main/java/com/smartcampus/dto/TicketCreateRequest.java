package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketCreateRequest {

    @NotBlank(message = "Category is required")
    @Size(max = 30, message = "Category must not exceed 30 characters")
    private String category;

    @NotBlank(message = "Priority is required")
    @Size(max = 20, message = "Priority must not exceed 20 characters")
    private String priority;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 150, message = "Resource/Location must not exceed 150 characters")
    private String resourceOrLocation;

    @Size(max = 100, message = "Preferred contact must not exceed 100 characters")
    private String preferredContact;

    @Positive(message = "Resource ID must be a positive number")
    private Long resourceId;
}
