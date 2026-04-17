package com.smartcampus.dto;

import com.smartcampus.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDto {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private String location;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer attendees;
    private BookingStatus status;
    private String adminReason;
    private Long requestedById;
    private String requestedByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
