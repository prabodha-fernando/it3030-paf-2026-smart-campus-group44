package com.smartcampus.service;

import com.smartcampus.dto.TicketStatusUpdateRequest;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.enums.Role;
import com.smartcampus.event.CommentAddedEvent;
import com.smartcampus.event.TicketStatusChangedEvent;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketAttachmentRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private static final Path UPLOAD_ROOT = Paths.get("uploads", "tickets");

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Ticket createTicket(Ticket request) {
        User currentUser = authService.getCurrentUser();

        Ticket ticket = Ticket.builder()
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus() != null ? request.getStatus() : TicketStatus.OPEN)
                .user(currentUser)
                .assignedTo(request.getAssignedTo())
                .resolutionNotes(request.getResolutionNotes())
                .build();

        return ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllWithExistingUsersOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    @Transactional
    public Ticket updateStatus(Long id, TicketStatusUpdateRequest request) {
        if (request == null) {
            throw new ConflictException("Status payload is required");
        }

        Ticket ticket = getTicketById(id);
        TicketStatus newStatus = parseStatus(request.getStatus());
        User currentUser = authService.getCurrentUser();

        validateStatusUpdatePermission(ticket, currentUser, newStatus);

        if (newStatus == TicketStatus.REJECTED) {
            if (request.getReason() == null || request.getReason().isBlank()) {
                throw new ConflictException("Rejection reason is required");
            }
            ticket.setRejectionReason(request.getReason().trim());
        } else {
            ticket.setRejectionReason(null);
        }

        if (ticket.getStatus() == newStatus) {
            throw new ConflictException("Ticket already has status " + newStatus);
        }

        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);

        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                this,
                saved.getUser().getId(),
                saved.getId(),
                saved.getStatus().name()
        ));

        return saved;
    }

    @Transactional
    public TicketComment addComment(Long ticketId, TicketComment request) {
        Ticket ticket = getTicketById(ticketId);
        User currentUser = authService.getCurrentUser();

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(currentUser)
                .content(request.getContent())
                .build();

        TicketComment saved = ticketCommentRepository.save(comment);

        eventPublisher.publishEvent(new CommentAddedEvent(
                this,
                ticket.getUser().getId(),
                ticket.getId(),
                currentUser.getDisplayName() != null ? currentUser.getDisplayName() : currentUser.getEmail()
        ));

        return saved;
    }

    @Transactional
    public TicketAttachment uploadAttachment(Long ticketId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ConflictException("File is required");
        }

        Ticket ticket = getTicketById(ticketId);
        long attachmentCount = ticketAttachmentRepository.countByTicketId(ticketId);
        if (attachmentCount >= 3) {
            throw new ConflictException("Maximum 3 attachments are allowed per ticket");
        }

        try {
            Files.createDirectories(UPLOAD_ROOT);

            String originalName = file.getOriginalFilename() == null
                    ? "file.bin"
                    : file.getOriginalFilename();
            String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String finalName = UUID.randomUUID() + "_" + safeName;

            Path destination = UPLOAD_ROOT.resolve(finalName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            TicketAttachment attachment = TicketAttachment.builder()
                    .ticket(ticket)
                    .fileName(originalName)
                    .filePath(destination.toString().replace('\\', '/'))
                    .build();

            return ticketAttachmentRepository.save(attachment);
        } catch (IOException e) {
            throw new ConflictException("Failed to upload file");
        }
    }

    @Transactional(readOnly = true)
    public List<TicketComment> getComments(Long ticketId) {
        getTicketById(ticketId);
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    @Transactional(readOnly = true)
    public List<TicketAttachment> getAttachments(Long ticketId) {
        getTicketById(ticketId);
        return ticketAttachmentRepository.findByTicketIdOrderByUploadedAtDesc(ticketId);
    }

    @Transactional
    public Ticket assignTechnician(Long ticketId, Long userId) {
        Ticket ticket = getTicketById(ticketId);
        User assignee = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (assignee.getRole() != Role.TECHNICIAN
                && assignee.getRole() != Role.SECURITY_OFFICER) {
            throw new ConflictException("Assignee must be a technician or security officer");
        }

        ticket.setAssignedTo(assignee);
        return ticketRepository.save(ticket);
    }

    private void validateStatusUpdatePermission(Ticket ticket, User currentUser, TicketStatus newStatus) {
        boolean isAdmin = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPER_ADMIN;
        boolean isAssignedStaff = ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignedStaff) {
            throw new ConflictException("Only assigned staff or admin can update ticket status");
        }

        if (newStatus == TicketStatus.REJECTED && !isAdmin) {
            throw new ConflictException("Only admin can reject tickets");
        }
    }

    private TicketStatus parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new ConflictException("Status is required");
        }

        String normalized = rawStatus.trim();

        if (normalized.startsWith("\"") && normalized.endsWith("\"")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }

        if (normalized.startsWith("{") && normalized.contains(":")) {
            normalized = normalized.replaceAll("[{}\" ]", "");
            String[] parts = normalized.split(":", 2);
            normalized = parts.length == 2 ? parts[1] : normalized;
        }

        try {
            return TicketStatus.valueOf(normalized.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ConflictException("Invalid status: " + rawStatus);
        }
    }
}
