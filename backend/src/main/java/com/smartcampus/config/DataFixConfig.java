package com.smartcampus.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataFixConfig {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixInvalidUserIds() {
        log.info("Starting data fix for uninitialized user IDs...");

        // 1. Fix bookings table
        try {
            // Attempt to sync user_id from requested_by if user_id exists
            // This handles the case where data was previously stored in the old column name
            int updatedRows = jdbcTemplate.update(
                "UPDATE bookings SET user_id = requested_by WHERE user_id = 0"
            );
            log.info("Bookings user_id migration completed. Updated {} rows.", updatedRows);
        } catch (Exception e) {
            log.warn("Could not copy from requested_by (user_id might not exist in bookings). Running fallback cleanup...");
            try {
                // Fallback: Delete bookings with requested_by 0 or null as they are orphaned/corrupted
                int deletedRows = jdbcTemplate.update(
                    "DELETE FROM bookings WHERE requested_by = 0 OR requested_by IS NULL"
                );
                log.info("Fallback completed. Deleted {} orphaned rows from bookings table.", deletedRows);
            } catch (Exception ex) {
                log.error("Critical: Failed to clean up invalid requested_by IDs in bookings.", ex);
            }
        }

        // 2. Fix notifications table
        try {
            int updatedNotifs = jdbcTemplate.update(
                "UPDATE notifications SET user_id = 1 WHERE user_id = 0"
            );
            if (updatedNotifs > 0) {
                log.info("Repaired {} orphaned notifications.", updatedNotifs);
            }
        } catch (Exception e) {
            log.error("Failed to repair notifications table.", e);
        }

        // 3. Fix notif_preferences table
        try {
            int updatedPrefs = jdbcTemplate.update(
                "UPDATE notif_preferences SET user_id = 1 WHERE user_id = 0"
            );
            if (updatedPrefs > 0) {
                log.info("Repaired {} orphaned notification preferences.", updatedPrefs);
            }
        } catch (Exception e) {
            log.error("Failed to repair notif_preferences table.", e);
        }
    }
}
