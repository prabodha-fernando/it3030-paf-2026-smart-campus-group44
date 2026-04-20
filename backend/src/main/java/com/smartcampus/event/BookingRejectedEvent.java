package com.smartcampus.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BookingRejectedEvent extends ApplicationEvent {
    private final Long userId;
    private final Long bookingId;
    private final String resourceName;
    private final String reason;

    public BookingRejectedEvent(Object source, Long userId, Long bookingId,
                                 String resourceName, String reason) {
        super(source);
        this.userId = userId;
        this.bookingId = bookingId;
        this.resourceName = resourceName;
        this.reason = reason;
    }

    
}
