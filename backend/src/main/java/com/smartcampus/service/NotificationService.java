package com.smartcampus.service;

import com.smartcampus.dto.NotifPreferenceDto;
import com.smartcampus.dto.NotificationDto;
import com.smartcampus.enums.NotifCategory;
import com.smartcampus.enums.NotifPriority;
import com.smartcampus.event.*;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotifPreference;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotifPreferenceRepository;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotifPreferenceRepository notifPreferenceRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuthService authService;

    @EventListener
    public void handleBookingApproved(BookingApprovedEvent event) {
        createAndSend(event.getUserId(),
                "Booking approved",
                "Your booking for " + event.getResourceName()
                        + " on " + event.getBookingDate() + " has been approved.",
                NotifCategory.BOOKING, NotifPriority.HIGH,
                event.getBookingId(), "BOOKING");
    }

    @EventListener
    public void handleBookingRejected(BookingRejectedEvent event) {
        createAndSend(event.getUserId(),
                "Booking rejected",
                "Your booking for " + event.getResourceName()
                        + " was rejected. Reason: " + event.getReason(),
                NotifCategory.BOOKING, NotifPriority.HIGH,
                event.getBookingId(), "BOOKING");
    }

    @EventListener
    public void handleTicketStatusChanged(TicketStatusChangedEvent event) {
        createAndSend(event.getUserId(),
                "Ticket status updated",
                "Ticket #" + event.getTicketId()
                        + " is now " + event.getNewStatus() + ".",
                NotifCategory.TICKET, NotifPriority.MEDIUM,
                event.getTicketId(), "TICKET");
    }

    @EventListener
    public void handleCommentAdded(CommentAddedEvent event) {
        createAndSend(event.getTicketOwnerId(),
                "New comment on your ticket",
                event.getCommenterName()
                        + " commented on Ticket #" + event.getTicketId() + ".",
                NotifCategory.COMMENT, NotifPriority.LOW,
                event.getTicketId(), "TICKET");
    }

    @EventListener
    public void handleRoleRequestProcessed(RoleRequestProcessedEvent event) {
        String message = "APPROVED".equals(event.getStatus())
                ? "Your request for " + event.getRequestedRole()
                        + " role has been approved!"
                : "Your request for " + event.getRequestedRole()
                        + " role was rejected."
                        + (event.getAdminNote() != null
                                ? " Note: " + event.getAdminNote() : "");

        createAndSend(event.getUserId(),
                "Role request " + event.getStatus().toLowerCase(),
                message,
                NotifCategory.ROLE_REQUEST, NotifPriority.HIGH,
                null, null);
    }

    @EventListener
    public void handleRoleChanged(RoleChangedEvent event) {
                try {
                        createAndSend(event.getUserId(),
                                        "Your role has been updated",
                                        "Your role has been changed to " + event.getNewRole() + ".",
                                        NotifCategory.ROLE_REQUEST, NotifPriority.HIGH,
                                        null, null);
                } catch (Exception ex) {
                        // Do not break role changes when notification publishing fails.
                        log.error("Failed to send role-changed notification for user {}", event.getUserId(), ex);
                }
    }

    @Transactional
    public void createAndSend(Long userId, String title, String message,
                               NotifCategory category, NotifPriority priority,
                               Long referenceId, String referenceType) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        if (!shouldNotify(user, category)) return;

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .category(category)
                .priority(priority)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .build();

        notificationRepository.save(notification);
        NotificationDto dto = toDto(notification);

        messagingTemplate.convertAndSendToUser(
                user.getEmail(), "/queue/notifications", dto);
        messagingTemplate.convertAndSend("/topic/admin-feed", dto);
    }

    public Page<NotificationDto> getMyNotifications(int page, int size) {
        User user = authService.getCurrentUser();
        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user, PageRequest.of(page, size))
                .map(this::toDto);
    }

    @Transactional
    public NotificationDto markAsRead(Long id) {
        User user = authService.getCurrentUser();
        Notification notif = notificationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found"));
        notif.setRead(true);
        return toDto(notificationRepository.save(notif));
    }

    @Transactional
    public void markAllAsRead() {
        User user = authService.getCurrentUser();
        notificationRepository.markAllAsReadForUser(user.getId());
    }

    @Transactional
    public void deleteNotification(Long id) {
        User user = authService.getCurrentUser();
        Notification notif = notificationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found"));
        notificationRepository.delete(notif);
    }

    public NotifPreferenceDto getPreferences() {
        User user = authService.getCurrentUser();
        NotifPreference pref = notifPreferenceRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreference(user));
        return toPrefDto(pref);
    }

    @Transactional
    public NotifPreferenceDto updatePreferences(NotifPreferenceDto request) {
        User user = authService.getCurrentUser();
        NotifPreference pref = notifPreferenceRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreference(user));

        pref.setBookingUpdates(request.isBookingUpdates());
        pref.setTicketUpdates(request.isTicketUpdates());
        pref.setCommentAlerts(request.isCommentAlerts());
        pref.setRoleRequestUpdates(request.isRoleRequestUpdates());
        pref.setDndEnabled(request.isDndEnabled());
        pref.setDndStart(request.getDndStart());
        pref.setDndEnd(request.getDndEnd());

        return toPrefDto(notifPreferenceRepository.save(pref));
    }

    public long getUnreadCount() {
        User user = authService.getCurrentUser();
        return notificationRepository.countByUserAndReadFalse(user);
    }

    private boolean shouldNotify(User user, NotifCategory category) {
        return notifPreferenceRepository.findByUser(user)
                .map(pref -> switch (category) {
                    case BOOKING       -> pref.isBookingUpdates();
                    case TICKET        -> pref.isTicketUpdates();
                    case COMMENT       -> pref.isCommentAlerts();
                    case ROLE_REQUEST  -> pref.isRoleRequestUpdates();
                    default            -> true;
                })
                .orElse(true);
    }

    private NotifPreference createDefaultPreference(User user) {
        NotifPreference pref = NotifPreference.builder()
                .user(user)
                .bookingUpdates(true)
                .ticketUpdates(true)
                .commentAlerts(true)
                .roleRequestUpdates(true)
                .dndEnabled(false)
                .build();
        return notifPreferenceRepository.save(pref);
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory())
                .priority(n.getPriority())
                .read(n.isRead())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private NotifPreferenceDto toPrefDto(NotifPreference p) {
        return NotifPreferenceDto.builder()
                .bookingUpdates(p.isBookingUpdates())
                .ticketUpdates(p.isTicketUpdates())
                .commentAlerts(p.isCommentAlerts())
                .roleRequestUpdates(p.isRoleRequestUpdates())
                .dndEnabled(p.isDndEnabled())
                .dndStart(p.getDndStart())
                .dndEnd(p.getDndEnd())
                .build();
    }
    
}
