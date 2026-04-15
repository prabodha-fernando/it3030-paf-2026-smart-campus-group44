package com.smartcampus.event;

import com.smartcampus.enums.Role;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class RoleChangedEvent extends ApplicationEvent{
    private final Long userId;
    private final Role newRole;
    private final Role oldRole;

    public RoleChangedEvent(Object source, Long userId,
                             Role newRole, Role oldRole) {
        super(source);
        this.userId = userId;
        this.newRole = newRole;
        this.oldRole = oldRole;
    }
    
}
