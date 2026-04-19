package com.smartcampus.dto;

import com.smartcampus.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private TicketStatus status;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
