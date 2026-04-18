package com.smartcampus.controller;

import com.smartcampus.dto.TicketStatusUpdateRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.model.TicketComment;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<?> createTicket(@RequestBody Ticket ticket) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(ticket));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Ticket getTicket(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addComment(@PathVariable Long id,
                                        @RequestBody TicketComment comment) {
        TicketComment created = ticketService.addComment(id, comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
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

    @PutMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> assignTechnician(@PathVariable Long id,
                                              @PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, userId));
    }
}
