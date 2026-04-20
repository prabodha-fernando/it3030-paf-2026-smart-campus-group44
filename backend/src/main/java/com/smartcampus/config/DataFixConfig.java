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
        log.info("Starting data fix for uninitialized user IDs in bookings table...");
        try {
            // Attempt to sync user_id from requested_by if requested_by exists
            // This handles the case where data was previously stored in the old column name
            int updatedRows = jdbcTemplate.update(
                "UPDATE bookings SET user_id = requested_by WHERE user_id = 0"
            );
            log.info("Data fix completed. Updated {} rows in bookings table.", updatedRows);

            // Fix notifications table
            int updatedNotifs = jdbcTemplate.update(
                "UPDATE notifications SET user_id = 1 WHERE user_id = 0"
            );
            if (updatedNotifs > 0) log.info("Repaired {} orphaned notifications.", updatedNotifs);

            // Fix notif_preferences table
            int updatedPrefs = jdbcTemplate.update(
                "UPDATE notif_preferences SET user_id = 1 WHERE user_id = 0"
            );
            if (updatedPrefs > 0) log.info("Repaired {} orphaned notification preferences.", updatedPrefs);

        } catch (Exception e) {
            log.warn("Could not copy from requested_by (it might not exist). Trying fallback cleanup...");
            try {
                // Fallback: Delete bookings with user_id 0 as they are orphaned/corrupted
                int deletedRows = jdbcTemplate.update(
                    "DELETE FROM bookings WHERE user_id = 0"
                );
                log.info("Fallback completed. Deleted {} orphaned rows from bookings table.", deletedRows);
            } catch (Exception ex) {
                log.error("Critical: Failed to clean up invalid user IDs. Manual DB intervention may be required.", ex);
            }
        }
    }
}
