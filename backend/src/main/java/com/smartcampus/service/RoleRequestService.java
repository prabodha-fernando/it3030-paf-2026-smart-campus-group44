package com.smartcampus.service;

import com.smartcampus.dto.CreateRoleRequestDto;
import com.smartcampus.dto.ProcessRoleRequestDto;
import com.smartcampus.dto.RoleRequestDto;
import com.smartcampus.enums.Role;
import com.smartcampus.event.RoleRequestProcessedEvent;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.RoleRequest;
import com.smartcampus.model.User;
import com.smartcampus.repository.RoleRequestRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RoleRequestService {

    private final RoleRequestRepository roleRequestRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public RoleRequestDto submitRequest(CreateRoleRequestDto request) {
        User user = authService.getCurrentUser();

        if (roleRequestRepository.existsByUserAndStatus(user, "PENDING")) {
            throw new ConflictException(
                    "You already have a pending role upgrade request");
        }

        if (user.getRole() == request.getRequestedRole()) {
            throw new ConflictException(
                    "You already have the requested role");
        }

        RoleRequest roleRequest = RoleRequest.builder()
                .user(user)
                .currentRole(user.getRole())
                .requestedRole(request.getRequestedRole())
                .justification(request.getJustification())
                .status("PENDING")
                .build();

        return toDto(roleRequestRepository.save(roleRequest));
    }

    @Transactional(readOnly = true)
    public List<RoleRequestDto> getRequests(String status) {
        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN
                || currentUser.getRole() == Role.SUPER_ADMIN;

        if (isAdmin) {
            return (status != null && !status.isBlank()
                    ? roleRequestRepository
                        .findByStatusOrderByCreatedAtDesc(status.toUpperCase())
                    : roleRequestRepository.findAllByOrderByCreatedAtDesc())
                    .stream().map(this::toDto).toList();
        }

        return roleRequestRepository
                .findByUserOrderByCreatedAtDesc(currentUser)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public RoleRequestDto processRequest(Long id, ProcessRoleRequestDto request) {
        User admin    = authService.getCurrentUser();
        RoleRequest rr = roleRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role request not found"));

        if (!"PENDING".equals(rr.getStatus())) {
            throw new ConflictException("This request has already been processed");
        }

        rr.setStatus(request.getStatus());
        rr.setAdminNote(request.getAdminNote());
        rr.setReviewedBy(admin);
        rr.setReviewedAt(LocalDateTime.now());

        if ("APPROVED".equals(request.getStatus())) {
            User user = rr.getUser();
            user.setRole(rr.getRequestedRole());
            userRepository.save(user);
        }

        roleRequestRepository.save(rr);

        eventPublisher.publishEvent(new RoleRequestProcessedEvent(
                this, rr.getUser().getId(),
                request.getStatus(), rr.getRequestedRole(),
                request.getAdminNote()));

        return toDto(rr);
    }

    @Transactional
    public void cancelRequest(Long id) {
        User currentUser = authService.getCurrentUser();
        RoleRequest rr = roleRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role request not found"));

        if (!rr.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You are not allowed to cancel this request");
        }
        if (!"PENDING".equals(rr.getStatus())) {
            throw new ConflictException(
                    "Only pending requests can be cancelled");
        }

        roleRequestRepository.delete(rr);
    }

    private RoleRequestDto toDto(RoleRequest rr) {
        return RoleRequestDto.builder()
                .id(rr.getId())
                .userId(rr.getUser().getId())
                .userEmail(rr.getUser().getEmail())
                .userDisplayName(rr.getUser().getDisplayName())
                .currentRole(rr.getCurrentRole())
                .requestedRole(rr.getRequestedRole())
                .justification(rr.getJustification())
                .status(rr.getStatus())
                .adminNote(rr.getAdminNote())
                .createdAt(rr.getCreatedAt())
                .reviewedAt(rr.getReviewedAt())
                .build();
    }
    
}
