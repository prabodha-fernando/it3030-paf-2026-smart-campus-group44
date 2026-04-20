package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "notif_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotifPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "booking_updates", nullable = false)
    @Builder.Default
    private boolean bookingUpdates = true;

    @Column(name = "ticket_updates", nullable = false)
    @Builder.Default
    private boolean ticketUpdates = true;

    @Column(name = "comment_alerts", nullable = false)
    @Builder.Default
    private boolean commentAlerts = true;

    @Column(name = "role_request_updates", nullable = false)
    @Builder.Default
    private boolean roleRequestUpdates = true;

    @Column(name = "dnd_enabled", nullable = false)
    @Builder.Default
    private boolean dndEnabled = false;

    @Column(name = "dnd_start")
    private LocalTime dndStart;

    @Column(name = "dnd_end")
    private LocalTime dndEnd;
    
}
