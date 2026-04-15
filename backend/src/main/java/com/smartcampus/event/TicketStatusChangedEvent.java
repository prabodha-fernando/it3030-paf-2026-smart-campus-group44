package com.smartcampus.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketStatusChangedEvent extends ApplicationEvent{
    private final Long userId;
    private final Long ticketId;
    private final String newStatus;

    public TicketStatusChangedEvent(Object source, Long userId,
                                     Long ticketId, String newStatus) {
        super(source);
        this.userId = userId;
        this.ticketId = ticketId;
        this.newStatus = newStatus;
    }
    
}
