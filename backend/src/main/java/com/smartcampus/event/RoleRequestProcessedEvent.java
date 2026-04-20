package com.smartcampus.event;

import com.smartcampus.enums.Role;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class RoleRequestProcessedEvent extends ApplicationEvent {
    private final Long userId;
    private final String status;
    private final Role requestedRole;
    private final String adminNote;

    public RoleRequestProcessedEvent(Object source, Long userId, String status,
                                      Role requestedRole, String adminNote) {
        super(source);
        this.userId = userId;
        this.status = status;
        this.requestedRole = requestedRole;
        this.adminNote = adminNote;
    }
    
}
