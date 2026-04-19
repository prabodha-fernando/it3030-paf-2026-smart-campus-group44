package com.smartcampus.repository;

import com.smartcampus.enums.BookingStatus;
import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Booking findFirstByOrderByResourceIdDesc();

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.requestedBy = :user",
           countQuery = "select count(b) from Booking b where b.requestedBy = :user")
    Page<Booking> findAllByRequestedBy(@Param("user") User requestedBy, Pageable pageable);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.requestedBy = :user and b.status = :status",
           countQuery = "select count(b) from Booking b where b.requestedBy = :user and b.status = :status")
    Page<Booking> findAllByRequestedByAndStatus(@Param("user") User requestedBy,
                                              @Param("status") BookingStatus status,
                                              Pageable pageable);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.requestedBy = :user and b.resourceId = :resourceId",
           countQuery = "select count(b) from Booking b where b.requestedBy = :user and b.resourceId = :resourceId")
    Page<Booking> findAllByRequestedByAndResourceId(@Param("user") User requestedBy,
                                                    @Param("resourceId") String resourceId,
                                                    Pageable pageable);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.requestedBy = :user and b.resourceId = :resourceId and b.status = :status",
           countQuery = "select count(b) from Booking b where b.requestedBy = :user and b.resourceId = :resourceId and b.status = :status")
    Page<Booking> findAllByRequestedByAndResourceIdAndStatus(@Param("user") User requestedBy,
                                                            @Param("resourceId") String resourceId,
                                                            @Param("status") BookingStatus status,
                                                            Pageable pageable);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.status = :status",
           countQuery = "select count(b) from Booking b where b.status = :status")
    Page<Booking> findAllByStatus(@Param("status") BookingStatus status, Pageable pageable);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.resourceId = :resourceId",
           countQuery = "select count(b) from Booking b where b.resourceId = :resourceId")
    Page<Booking> findAllByResourceId(@Param("resourceId") String resourceId, Pageable pageable);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.resourceId = :resourceId and b.status = :status",
           countQuery = "select count(b) from Booking b where b.resourceId = :resourceId and b.status = :status")
    Page<Booking> findAllByResourceIdAndStatus(@Param("resourceId") String resourceId,
                                               @Param("status") BookingStatus status,
                                               Pageable pageable);

    boolean existsByResourceIdAndStatusAndDateAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            BookingStatus status,
            LocalDate date,
            LocalTime endTime,
            LocalTime startTime);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.date between :startDate and :endDate",
           countQuery = "select count(b) from Booking b where b.date between :startDate and :endDate")
    Page<Booking> findAllByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.date between :startDate and :endDate and b.status = :status",
           countQuery = "select count(b) from Booking b where b.date between :startDate and :endDate and b.status = :status")
    Page<Booking> findAllByDateBetweenAndStatus(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate,
                                                @Param("status") BookingStatus status, Pageable pageable);

    // Methods for regular users with date range filtering
    @Query(value = "select b from Booking b join fetch b.requestedBy where b.requestedBy = :user and b.date between :startDate and :endDate",
           countQuery = "select count(b) from Booking b where b.requestedBy = :user and b.date between :startDate and :endDate")
    Page<Booking> findAllByRequestedByAndDateBetween(@Param("user") User requestedBy, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

    @Query(value = "select b from Booking b join fetch b.requestedBy where b.requestedBy = :user and b.date between :startDate and :endDate and b.status = :status",
           countQuery = "select count(b) from Booking b where b.requestedBy = :user and b.date between :startDate and :endDate and b.status = :status")
    Page<Booking> findAllByRequestedByAndDateBetweenAndStatus(@Param("user") User requestedBy, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate,
                                                             @Param("status") BookingStatus status, Pageable pageable);

}
