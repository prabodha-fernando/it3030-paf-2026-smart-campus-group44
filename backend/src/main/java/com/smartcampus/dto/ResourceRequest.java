package com.smartcampus.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Type cannot be blank")
    private String type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location cannot be blank")
    private String location;

    private String status;

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;

    private String description;
}
