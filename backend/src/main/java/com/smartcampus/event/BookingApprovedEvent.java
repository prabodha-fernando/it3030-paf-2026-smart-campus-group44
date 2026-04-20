package com.smartcampus.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BookingApprovedEvent extends ApplicationEvent {

    private final Long userId;
    private final Long bookingId;
    private final String resourceName;
    private final String bookingDate;

    public BookingApprovedEvent(Object source, Long userId, Long bookingId,
                                 String resourceName, String bookingDate) {
        super(source);
        this.userId = userId;
        this.bookingId = bookingId;
        this.resourceName = resourceName;
        this.bookingDate = bookingDate;
    }
    
}
