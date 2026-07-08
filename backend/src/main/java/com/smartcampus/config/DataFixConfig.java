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
        boolean bookingsHasUserId = columnExists("bookings", "user_id");
        boolean bookingsHasRequestedBy = columnExists("bookings", "requested_by");

        if (bookingsHasUserId && bookingsHasRequestedBy) {
            int updatedRows = jdbcTemplate.update(
                    "UPDATE bookings SET user_id = requested_by WHERE user_id = 0");
            log.info("Data fix completed. Updated {} rows in bookings table.", updatedRows);
        } else if (bookingsHasRequestedBy) {
            int deletedRows = jdbcTemplate.update(
                    "DELETE FROM bookings WHERE requested_by = 0 OR requested_by IS NULL");
            log.info("Fallback completed. Deleted {} orphaned rows from bookings table.", deletedRows);
        } else {
            log.warn("Skipping bookings data fix because no known user reference column exists.");
        }

        // Fix notifications table
        if (columnExists("notifications", "user_id")) {
            int updatedNotifs = jdbcTemplate.update(
                    "UPDATE notifications SET user_id = 1 WHERE user_id = 0");
            if (updatedNotifs > 0) {
                log.info("Repaired {} orphaned notifications.", updatedNotifs);
            }
        }

        // Fix notif_preferences table
        if (columnExists("notif_preferences", "user_id")) {
            int updatedPrefs = jdbcTemplate.update(
                    "UPDATE notif_preferences SET user_id = 1 WHERE user_id = 0");
            if (updatedPrefs > 0) {
                log.info("Repaired {} orphaned notification preferences.", updatedPrefs);
            }
        }
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                  AND column_name = ?
                """, Integer.class, tableName, columnName);
        return count != null && count > 0;
    }
}
