package com.smartcampus.controller;

import com.smartcampus.dto.CreateRoleRequestDto;
import com.smartcampus.dto.ProcessRoleRequestDto;
import com.smartcampus.dto.RoleRequestDto;
import com.smartcampus.service.RoleRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/role-requests")
@RequiredArgsConstructor
public class RoleRequestController {

    private final RoleRequestService roleRequestService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoleRequestDto> submitRequest(
            @Valid @RequestBody CreateRoleRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roleRequestService.submitRequest(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RoleRequestDto>> getRequests(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(roleRequestService.getRequests(status));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<RoleRequestDto> processRequest(
            @PathVariable Long id,
            @Valid @RequestBody ProcessRoleRequestDto request) {
        return ResponseEntity.ok(roleRequestService.processRequest(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelRequest(@PathVariable Long id) {
        roleRequestService.cancelRequest(id);
        return ResponseEntity.noContent().build();
    }
    
}
