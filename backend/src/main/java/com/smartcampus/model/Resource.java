package com.smartcampus.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
// Adding indexes makes database searches (filtering by type or status)
// significantly faster
@Table(name = "resources", indexes = {
        @Index(name = "idx_resource_type", columnList = "type"),
        @Index(name = "idx_resource_status", columnList = "status")
})
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Resource type is required")
    @Column(nullable = false, length = 50)
    private String type;

    @NotNull(message = "Capacity must be specified")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Column(nullable = false)
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Column(nullable = false, length = 150)
    private String location;

    @NotNull(message = "Status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ResourceStatus status;

    @NotNull(message = "Availability start time is required")
    @Column(name = "availability_start", nullable = false)
    private LocalTime availabilityStart;

    @NotNull(message = "Availability end time is required")
    @Column(name = "availability_end", nullable = false)
    private LocalTime availabilityEnd;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500)
    private String description;

    // Optimistic Locking: Prevents two admins from overwriting each other's edits
    // simultaneously
    @Version
    private Long version;

    // Audit Trails: Automatically tracks exactly when the resource was added to the
    // system
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Audit Trails: Automatically updates the timestamp whenever the resource is
    // modified
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}