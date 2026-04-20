package com.smartcampus.dto;

import com.smartcampus.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEventDto {

    private Long id;
    private String title;
    private LocalDateTime start;
    private LocalDateTime end;
    private String resourceName;
    private String resourceType;
    private String location;
    private String purpose;
    private Integer attendees;
    private BookingStatus status;
    private String requestedByEmail;
    private boolean canModify;

}