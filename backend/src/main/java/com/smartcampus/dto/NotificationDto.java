package com.smartcampus.dto;

import com.smartcampus.enums.NotifCategory;
import com.smartcampus.enums.NotifPriority;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private NotifCategory category;
    private NotifPriority priority;
    private boolean read;
    private Long referenceId;
    private String referenceType;
    private LocalDateTime createdAt;
    
}
