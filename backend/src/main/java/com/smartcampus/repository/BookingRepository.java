package com.smartcampus.repository;

import com.smartcampus.enums.BookingStatus;
import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Booking findFirstByOrderByResourceIdDesc();

    Page<Booking> findAllByRequestedBy(User requestedBy, Pageable pageable);
    Page<Booking> findAllByRequestedByAndStatus(User requestedBy,
                                              BookingStatus status,
                                              Pageable pageable);
    Page<Booking> findAllByRequestedByAndResourceId(User requestedBy,
                                                    String resourceId,
                                                    Pageable pageable);
    Page<Booking> findAllByRequestedByAndResourceIdAndStatus(User requestedBy,
                                                            String resourceId,
                                                            BookingStatus status,
                                                            Pageable pageable);

    Page<Booking> findAllByStatus(BookingStatus status, Pageable pageable);
    Page<Booking> findAllByResourceId(String resourceId, Pageable pageable);
    Page<Booking> findAllByResourceIdAndStatus(String resourceId,
                                               BookingStatus status,
                                               Pageable pageable);

    boolean existsByResourceIdAndStatusAndDateAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            BookingStatus status,
            LocalDate date,
            LocalTime endTime,
            LocalTime startTime);

    Page<Booking> findAllByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<Booking> findAllByDateBetweenAndStatus(LocalDate startDate, LocalDate endDate,
                                                BookingStatus status, Pageable pageable);

    // Methods for regular users with date range filtering
    Page<Booking> findAllByRequestedByAndDateBetween(User requestedBy, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<Booking> findAllByRequestedByAndDateBetweenAndStatus(User requestedBy, LocalDate startDate, LocalDate endDate,
                                                             BookingStatus status, Pageable pageable);

}
