package com.smartcampus.repository;

import com.smartcampus.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    Optional<TicketComment> findByIdAndTicketId(Long id, Long ticketId);

    void deleteByTicketId(Long ticketId);
}
