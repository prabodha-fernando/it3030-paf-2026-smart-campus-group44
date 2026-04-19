package com.smartcampus.service;

import com.smartcampus.dto.TicketCommentCreateRequest;
import com.smartcampus.dto.TicketCommentUpdateRequest;
import com.smartcampus.dto.TicketCreateRequest;
import com.smartcampus.dto.TicketResolutionNotesUpdateRequest;
import com.smartcampus.dto.TicketStatusUpdateRequest;
import com.smartcampus.dto.TicketUpdateRequest;
import com.smartcampus.enums.Role;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.event.CommentAddedEvent;
import com.smartcampus.event.TicketStatusChangedEvent;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketAttachmentRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private static final Path UPLOAD_ROOT = Paths.get("uploads", "tickets");
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;

    private static final Set<String> ALLOWED_CATEGORIES = Set.of(
        "FACILITY", "ELECTRICAL", "NETWORK", "SECURITY", "OTHER"
    );

    private static final Set<String> ALLOWED_PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH");

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/jpg"
    );

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Ticket createTicket(TicketCreateRequest request) {
        User currentUser = authService.getCurrentUser();
        Long resourceId = request.getResourceId();
        Resource selectedResource = null;
        if (resourceId != null) {
            selectedResource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        }

        String resourceOrLocation = trimToNull(request.getResourceOrLocation());
        if (resourceOrLocation == null && selectedResource != null) {
            resourceOrLocation = selectedResource.getLocation();
        }

        Ticket ticket = Ticket.builder()
                .category(normalizeCategory(request.getCategory()))
                .description(request.getDescription().trim())
                .priority(normalizePriority(request.getPriority()))
                .resourceOrLocation(resourceOrLocation)
                .resourceId(resourceId)
                .preferredContact(validatePreferredContact(request.getPreferredContact()))
                .status(TicketStatus.OPEN)
                .user(currentUser)
                .build();

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateTicket(Long id, TicketUpdateRequest request) {
        Ticket ticket = getTicketById(id);
        User currentUser = authService.getCurrentUser();
        if (!canManageTicket(ticket, currentUser)) {
            throw new AccessDeniedException("You can only update your own tickets");
        }

        Long resourceId = request.getResourceId();
        Resource selectedResource = null;
        if (resourceId != null) {
            selectedResource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        }

        String location = trimToNull(request.getResourceOrLocation());
        if (location == null && selectedResource != null) {
            location = selectedResource.getLocation();
        }

        ticket.setCategory(normalizeCategory(request.getCategory()));
        ticket.setPriority(normalizePriority(request.getPriority()));
        ticket.setDescription(request.getDescription().trim());
        ticket.setResourceId(resourceId);
        ticket.setResourceOrLocation(location);
        ticket.setPreferredContact(validatePreferredContact(request.getPreferredContact()));
        return ticketRepository.save(ticket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        Ticket ticket = getTicketById(id);
        User currentUser = authService.getCurrentUser();
        if (!canManageTicket(ticket, currentUser)) {
            throw new AccessDeniedException("You can only delete your own tickets");
        }

        List<TicketAttachment> attachments = ticketAttachmentRepository.findByTicketIdOrderByUploadedAtDesc(id);
        for (TicketAttachment attachment : attachments) {
            try {
                Files.deleteIfExists(Paths.get(attachment.getFilePath()));
            } catch (Exception ignored) {
                // Best effort cleanup for local files.
            }
        }

        ticketCommentRepository.deleteByTicketId(id);
        ticketAttachmentRepository.deleteByTicketId(id);
        ticketRepository.delete(ticket);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getAllTickets() {
        User currentUser = authService.getCurrentUser();
        if (isAdmin(currentUser) || isStaff(currentUser)) {
            return ticketRepository.findAllWithExistingUsersOrderByCreatedAtDesc();
        }
        return ticketRepository.findAllVisibleToUserOrderByCreatedAtDesc(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public Ticket getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = authService.getCurrentUser();
        if (!canViewTicket(ticket, currentUser)) {
            throw new AccessDeniedException("You do not have access to this ticket");
        }

        return ticket;
    }

    @Transactional
    public Ticket updateStatus(Long id, TicketStatusUpdateRequest request) {
        Ticket ticket = getTicketById(id);
        TicketStatus newStatus = request.getStatus();
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
    public TicketComment addComment(Long ticketId, TicketCommentCreateRequest request) {
        Ticket ticket = getTicketById(ticketId);
        User currentUser = authService.getCurrentUser();

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(currentUser)
                .content(request.getContent().trim())
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
    public TicketComment updateComment(Long ticketId, Long commentId, TicketCommentUpdateRequest request) {
        getTicketById(ticketId);
        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        User currentUser = authService.getCurrentUser();
        boolean canEdit = comment.getAuthor().getId().equals(currentUser.getId()) || isAdmin(currentUser);
        if (!canEdit) {
            throw new AccessDeniedException("You can only edit your own comments");
        }

        comment.setContent(request.getContent().trim());
        return ticketCommentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId) {
        getTicketById(ticketId);
        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        User currentUser = authService.getCurrentUser();
        boolean canDelete = comment.getAuthor().getId().equals(currentUser.getId()) || isAdmin(currentUser);
        if (!canDelete) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        ticketCommentRepository.delete(comment);
    }

    @Transactional
    public TicketAttachment uploadAttachment(Long ticketId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ConflictException("File is required");
        }

        validateAttachmentFile(file);

        Ticket ticket = getTicketById(ticketId);
        User currentUser = authService.getCurrentUser();
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
                    .uploadedBy(currentUser)
                    .fileName(originalName)
                    .filePath(destination.toString().replace('\\', '/'))
                    .build();

            return ticketAttachmentRepository.save(attachment);
        } catch (IOException e) {
            throw new ConflictException("Failed to upload file");
        }
    }

    @Transactional
    public void deleteAttachment(Long ticketId, Long attachmentId) {
        Ticket ticket = getTicketById(ticketId);
        TicketAttachment attachment = ticketAttachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        User currentUser = authService.getCurrentUser();
        boolean isUploader = attachment.getUploadedBy() != null
                && attachment.getUploadedBy().getId().equals(currentUser.getId());
        boolean isTicketOwner = ticket.getUser().getId().equals(currentUser.getId());

        if (!isUploader && !isTicketOwner && !isAdmin(currentUser)) {
            throw new AccessDeniedException("You can only delete your own attachments");
        }

        try {
            Files.deleteIfExists(Paths.get(attachment.getFilePath()));
        } catch (Exception ignored) {
            // Continue even if file cleanup fails.
        }

        ticketAttachmentRepository.delete(attachment);
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
                && assignee.getRole() != Role.SECURITY_OFFICER
                && assignee.getRole() != Role.FACILITY_MANAGER) {
            throw new ConflictException("Assignee must be a technician, security officer, or facility manager");
        }

        ticket.setAssignedTo(assignee);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateResolutionNotes(Long ticketId, TicketResolutionNotesUpdateRequest request) {
        Ticket ticket = getTicketById(ticketId);
        User currentUser = authService.getCurrentUser();

        if (!canUpdateStatusAndResolution(currentUser)) {
            throw new AccessDeniedException("Only technician, security officer, facility manager, or admin can update resolution notes");
        }

        ticket.setResolutionNotes(request.getResolutionNotes().trim());
        return ticketRepository.save(ticket);
    }

    private void validateStatusUpdatePermission(Ticket ticket, User currentUser, TicketStatus newStatus) {
        boolean isAdmin = isAdmin(currentUser);

        if (!canUpdateStatusAndResolution(currentUser)) {
            throw new ConflictException("Only technician, security officer, facility manager, or admin can update ticket status");
        }

        if (newStatus == TicketStatus.REJECTED && !isAdmin) {
            throw new ConflictException("Only admin can reject tickets");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;
    }

    private boolean isStaff(User user) {
        return user.getRole() == Role.TECHNICIAN || user.getRole() == Role.SECURITY_OFFICER;
    }

    private boolean canUpdateStatusAndResolution(User user) {
        Role role = user.getRole();
        return role == Role.TECHNICIAN
                || role == Role.SECURITY_OFFICER
                || role == Role.FACILITY_MANAGER
                || role == Role.ADMIN
                || role == Role.SUPER_ADMIN;
    }

    private boolean canViewTicket(Ticket ticket, User user) {
        return isAdmin(user)
                || isStaff(user)
                || ticket.getUser().getId().equals(user.getId());
    }

    private boolean canManageTicket(Ticket ticket, User user) {
        return isAdmin(user) || ticket.getUser().getId().equals(user.getId());
    }

    private String normalizeCategory(String category) {
        String normalized = category == null ? "" : category.trim().toUpperCase();
        if (!ALLOWED_CATEGORIES.contains(normalized)) {
            throw new ConflictException("Invalid category: " + category);
        }
        return normalized;
    }

    private String normalizePriority(String priority) {
        String normalized = priority == null ? "" : priority.trim().toUpperCase();
        if (!ALLOWED_PRIORITIES.contains(normalized)) {
            throw new ConflictException("Invalid priority: " + priority);
        }
        return normalized;
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String validatePreferredContact(String preferredContact) {
        String value = trimToNull(preferredContact);
        return value;
    }

    private void validateAttachmentFile(MultipartFile file) {
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ConflictException("Only PNG, JPG, JPEG, or WEBP files are allowed");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ConflictException("File exceeds max size of 5MB");
        }
    }
}
