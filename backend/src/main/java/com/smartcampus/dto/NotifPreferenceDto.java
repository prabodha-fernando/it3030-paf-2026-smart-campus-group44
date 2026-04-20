package com.smartcampus.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
public class NotifPreferenceDto {
    private boolean bookingUpdates;
    private boolean ticketUpdates;
    private boolean commentAlerts;
    private boolean roleRequestUpdates;
    private boolean dndEnabled;
    private LocalTime dndStart;
    private LocalTime dndEnd;

    
}
