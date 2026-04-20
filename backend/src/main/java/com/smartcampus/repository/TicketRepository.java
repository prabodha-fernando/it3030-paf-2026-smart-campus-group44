package com.smartcampus.repository;

import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByOrderByCreatedAtDesc();

    @Query(value = "select t from Ticket t join fetch t.user where t.user = :user",
           countQuery = "select count(t) from Ticket t where t.user = :user")
    Page<Ticket> findAllByUser(@Param("user") User user, Pageable pageable);

    @Query(value = "select t from Ticket t join fetch t.user where t.status = :status",
           countQuery = "select count(t) from Ticket t where t.status = :status")
    Page<Ticket> findAllByStatus(@Param("status") TicketStatus status, Pageable pageable);

    @Query(value = "select t from Ticket t join fetch t.user where t.user = :user and t.status = :status",
           countQuery = "select count(t) from Ticket t where t.user = :user and t.status = :status")
    Page<Ticket> findAllByUserAndStatus(@Param("user") User user, @Param("status") TicketStatus status, Pageable pageable);

    @Query("select t from Ticket t join fetch t.user left join fetch t.assignedTo where t.user.id = :userId order by t.createdAt desc")
    List<Ticket> findAllVisibleToUserOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("select t from Ticket t join fetch t.user left join fetch t.assignedTo order by t.createdAt desc")
    List<Ticket> findAllWithExistingUsersOrderByCreatedAtDesc();
}
