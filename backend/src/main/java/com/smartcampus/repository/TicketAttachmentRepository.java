package com.smartcampus.repository;

import com.smartcampus.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicketIdOrderByUploadedAtDesc(Long ticketId);

    Optional<TicketAttachment> findByIdAndTicketId(Long id, Long ticketId);

    long countByTicketId(Long ticketId);

    void deleteByTicketId(Long ticketId);
}
