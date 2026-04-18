package com.smartcampus.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketStatusUpdateRequest {
    private String status;
    private String reason;
}
