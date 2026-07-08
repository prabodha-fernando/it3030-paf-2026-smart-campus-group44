package com.smartcampus.service;

import com.smartcampus.dto.ChangeRoleRequest;
import com.smartcampus.dto.UpdateProfileRequest;
import com.smartcampus.dto.UserDto;
import com.smartcampus.enums.Role;
import com.smartcampus.event.RoleChangedEvent;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;

    public UserDto getCurrentUserProfile() {
        return toDto(authService.getCurrentUser());
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        User user = authService.getCurrentUser();
        user.setDisplayName(request.getDisplayName());
        user.setDepartment(request.getDepartment());
        user.setPhone(request.getPhone());
        if (user.isFirstLogin()) {
            user.setFirstLogin(false);
        }
        return toDto(userRepository.save(user));
    }

    public List<UserDto> getAllUsers(String role, int page, int size) {
        if (role != null && !role.isBlank()) {
            Role roleEnum = Role.valueOf(role.toUpperCase());
            return userRepository
                    .findAllByRole(roleEnum, PageRequest.of(page, size))
                    .stream().map(this::toDto).toList();
        }
        return userRepository.findAll(PageRequest.of(page, size))
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public UserDto changeRole(@NonNull Long userId, ChangeRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getId().equals(userId)
                && !user.getRole().equals(request.getRole())) {
            throw new AccessDeniedException("You cannot change your own role");
        }

        Role oldRole = user.getRole();
        user.setRole(request.getRole());
        userRepository.save(user);
        eventPublisher.publishEvent(
                new RoleChangedEvent(this, user.getId(), request.getRole(), oldRole));
        return toDto(user);
    }

    @Transactional
    public UserDto changeMyRole(ChangeRoleRequest request) {
        User user = authService.getCurrentUser();
        if (request.getRole() == Role.SUPER_ADMIN || request.getRole() == Role.HOD) {
            throw new AccessDeniedException("You cannot switch to this role");
        }
        Role oldRole = user.getRole();

        if (!oldRole.equals(request.getRole())) {
            user.setRole(request.getRole());
            userRepository.save(user);
            eventPublisher.publishEvent(
                    new RoleChangedEvent(this, user.getId(), request.getRole(), oldRole));
        }

        return toDto(user);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .photoUrl(user.getPhotoUrl())
                .role(user.getRole())
                .firstLogin(user.isFirstLogin())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
    
}
