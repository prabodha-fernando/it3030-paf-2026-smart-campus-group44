package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByOrderByCreatedAtDesc();

    @Query("select t from Ticket t join fetch t.user left join fetch t.assignedTo where t.user.id = :userId order by t.createdAt desc")
    List<Ticket> findAllVisibleToUserOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("select t from Ticket t join fetch t.user left join fetch t.assignedTo order by t.createdAt desc")
    List<Ticket> findAllWithExistingUsersOrderByCreatedAtDesc();
}
