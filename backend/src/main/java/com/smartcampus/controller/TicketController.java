package com.smartcampus.controller;

import com.smartcampus.dto.TicketCommentCreateRequest;
import com.smartcampus.dto.TicketCommentUpdateRequest;
import com.smartcampus.dto.TicketCreateRequest;
import com.smartcampus.dto.TicketResolutionNotesUpdateRequest;
import com.smartcampus.dto.TicketStatusUpdateRequest;
import com.smartcampus.dto.TicketUpdateRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.model.TicketComment;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Ticket>> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ticketService.listMyTickets(page, size));
    }

    @GetMapping("/open")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Ticket>> getOpenTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ticketService.listOpenTickets(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Ticket getTicket(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateTicket(@PathVariable Long id,
                                          @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addComment(@PathVariable Long id,
                                        @Valid @RequestBody TicketCommentCreateRequest request) {
        TicketComment created = ticketService.addComment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateComment(@PathVariable Long ticketId,
                                           @PathVariable Long commentId,
                                           @Valid @RequestBody TicketCommentUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, request));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteComment(@PathVariable Long ticketId,
                                           @PathVariable Long commentId) {
        ticketService.deleteComment(ticketId, commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public List<TicketComment> getComments(@PathVariable Long id) {
        return ticketService.getComments(id);
    }

    @PostMapping("/{id}/attachments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadFile(@PathVariable Long id,
                                        @RequestParam("file") MultipartFile file) {
        TicketAttachment created = ticketService.uploadAttachment(id, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}/attachments")
    @PreAuthorize("isAuthenticated()")
    public List<TicketAttachment> getAttachments(@PathVariable Long id) {
        return ticketService.getAttachments(id);
    }

    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAttachment(@PathVariable Long ticketId,
                                              @PathVariable Long attachmentId) {
        ticketService.deleteAttachment(ticketId, attachmentId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> assignTechnician(@PathVariable Long id,
                                              @PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, userId));
    }

    @PutMapping("/{id}/resolution-notes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateResolutionNotes(
            @PathVariable Long id,
            @Valid @RequestBody TicketResolutionNotesUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateResolutionNotes(id, request));
    }
}
