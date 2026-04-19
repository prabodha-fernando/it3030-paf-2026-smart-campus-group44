package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketResolutionNotesUpdateRequest {

    @NotBlank(message = "Resolution notes are required")
    @Size(max = 3000, message = "Resolution notes must not exceed 3000 characters")
    private String resolutionNotes;
}
