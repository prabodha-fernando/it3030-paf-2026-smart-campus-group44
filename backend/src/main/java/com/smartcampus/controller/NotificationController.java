package com.smartcampus.controller;

import com.smartcampus.dto.NotifPreferenceDto;
import com.smartcampus.dto.NotificationDto;
import com.smartcampus.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications") // Fixed: Added leading slash
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Real-time notification management APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get a paginated list of the current user's notifications")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationDto>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.debug("Fetching notifications for user (page: {}, size: {})", page, size);
        return ResponseEntity.ok(notificationService.getMyNotifications(page, size));
    }

    @Operation(summary = "Get the total count of unread notifications for the badge icon")
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {

        log.debug("Fetching unread notification count");
        // CRITICAL FIX: Wrap the Long in a Map so React receives valid JSON -> {
        // "count": 5 }
        Long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @Operation(summary = "Mark a specific notification as read")
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {

        log.info("Marking notification ID {} as read", id);
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @Operation(summary = "Mark all of the user's notifications as read instantly")
    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead() {

        log.info("Marking all notifications as read for current user");
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete a specific notification from the user's inbox")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {

        log.info("Deleting notification ID {}", id);
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get user's notification delivery preferences")
    @GetMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotifPreferenceDto> getPreferences() {

        log.debug("Fetching notification preferences");
        return ResponseEntity.ok(notificationService.getPreferences());
    }

    @Operation(summary = "Update user's notification delivery preferences")
    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotifPreferenceDto> updatePreferences(
            @RequestBody NotifPreferenceDto request) {

        log.info("Updating notification preferences");
        return ResponseEntity.ok(notificationService.updatePreferences(request));
    }
}