package com.smartcampus.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentAddedEvent extends ApplicationEvent{
    private final Long ticketOwnerId;
    private final Long ticketId;
    private final String commenterName;

    public CommentAddedEvent(Object source, Long ticketOwnerId,
                              Long ticketId, String commenterName) {
        super(source);
        this.ticketOwnerId = ticketOwnerId;
        this.ticketId = ticketId;
        this.commenterName = commenterName;
    }
    
}
