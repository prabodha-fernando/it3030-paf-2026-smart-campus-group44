package com.smartcampus.service;

import com.smartcampus.dto.BookingDecisionDto;
import com.smartcampus.dto.BookingRequestDto;
import com.smartcampus.dto.BookingResponseDto;
import com.smartcampus.dto.CalendarEventDto;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.Role;
import com.smartcampus.event.BookingApprovedEvent;
import com.smartcampus.event.BookingRejectedEvent;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final String DATE_PROPERTY = "date";
    private static final String START_TIME_PROPERTY = "startTime";

    private final BookingRepository bookingRepository;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public BookingResponseDto createBooking(BookingRequestDto request) {
        // Auto-generate resource ID if not provided or generate a new one
        String resourceId = generateResourceId();

        validateDateTime(request.getStartTime(), request.getEndTime());
        checkBookingConflict(resourceId, request.getDate(),
                request.getStartTime(), request.getEndTime());

        User user = authService.getCurrentUser();
        Booking booking = Booking.builder()
                .resourceId(resourceId)
                .resourceName(request.getResourceName())
                .resourceType(request.getResourceType())
                .location(request.getLocation())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .status(BookingStatus.PENDING)
                .requestedBy(user)
                .build();

        return toDto(bookingRepository.save(booking));
    }

    private String generateResourceId() {
        // Generate unique resource ID in format R001, R002, etc.
        Booking latestBooking = bookingRepository.findFirstByOrderByResourceIdDesc();
        if (latestBooking == null || latestBooking.getResourceId() == null) {
            return "R001";
        }

        String maxResourceId = latestBooking.getResourceId();
        String numericPart = maxResourceId.replaceAll("^R", "");
        int nextNumber;
        try {
            nextNumber = Integer.parseInt(numericPart) + 1;
        } catch (NumberFormatException ex) {
            nextNumber = 1;
        }
        return String.format("R%03d", nextNumber);
    }

    public BookingResponseDto getBooking(Long id) {
        Booking booking = findBooking(id);
        User currentUser = authService.getCurrentUser();

        if (!booking.getRequestedBy().getId().equals(currentUser.getId()) &&
                !isAdmin(currentUser)) {
            throw new BadRequestException("Access denied for booking details");
        }
        return toDto(booking);
    }

    public Page<BookingResponseDto> listBookings(Optional<BookingStatus> status,
            Optional<String> resourceId,
            int page,
            int size) {
        User currentUser = authService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Order.desc(DATE_PROPERTY), Sort.Order.asc(START_TIME_PROPERTY)));

        Page<Booking> bookings;
        if (isAdmin(currentUser)) {
            if (resourceId.isPresent() && status.isPresent()) {
                bookings = bookingRepository.findAllByResourceIdAndStatus(
                        resourceId.get(), status.get(), pageable);
            } else if (resourceId.isPresent()) {
                bookings = bookingRepository.findAllByResourceId(resourceId.get(), pageable);
            } else if (status.isPresent()) {
                bookings = bookingRepository.findAllByStatus(status.get(), pageable);
            } else {
                bookings = bookingRepository.findAll(pageable);
            }
        } else {
            if (resourceId.isPresent() && status.isPresent()) {
                bookings = bookingRepository.findAllByRequestedByAndResourceIdAndStatus(
                        currentUser, resourceId.get(), status.get(), pageable);
            } else if (resourceId.isPresent()) {
                bookings = bookingRepository.findAllByRequestedByAndResourceId(
                        currentUser, resourceId.get(), pageable);
            } else if (status.isPresent()) {
                bookings = bookingRepository.findAllByRequestedByAndStatus(
                        currentUser, status.get(), pageable);
            } else {
                bookings = bookingRepository.findAllByRequestedBy(currentUser, pageable);
            }
        }
        return bookings.map(this::toDto);
    }

    @Transactional
    public BookingResponseDto updateBooking(Long id, BookingRequestDto request) {
        validateDateTime(request.getStartTime(), request.getEndTime());
        Booking booking = findBooking(id);
        User currentUser = authService.getCurrentUser();

        if (!booking.getRequestedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Only the booking owner can update a booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be updated");
        }
        checkBookingConflict(booking.getResourceId(), request.getDate(),
                request.getStartTime(), request.getEndTime());

        // Don't update resourceId as it's auto-generated and should remain the same
        booking.setResourceName(request.getResourceName());
        booking.setResourceType(request.getResourceType());
        booking.setLocation(request.getLocation());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setAttendees(request.getAttendees());

        return toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponseDto approveBooking(Long id, BookingDecisionDto decision) {
        Booking booking = findBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved");
        }
        checkBookingConflict(booking.getResourceId(), booking.getDate(),
                booking.getStartTime(), booking.getEndTime());
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminReason(decision.getReason());
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new BookingApprovedEvent(
                this,
                saved.getRequestedBy().getId(),
                saved.getId(),
                saved.getResourceName(),
                saved.getDate().toString()));
        return toDto(saved);
    }

    @Transactional
    public BookingResponseDto rejectBooking(Long id, BookingDecisionDto decision) {
        Booking booking = findBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(decision.getReason());
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new BookingRejectedEvent(
                this,
                saved.getRequestedBy().getId(),
                saved.getId(),
                saved.getResourceName(),
                decision.getReason()));
        return toDto(saved);
    }

    @Transactional
    public void cancelBooking(Long id) {
        Booking booking = findBooking(id);
        User currentUser = authService.getCurrentUser();

        if (!booking.getRequestedBy().getId().equals(currentUser.getId()) &&
                !isAdmin(currentUser)) {
            throw new BadRequestException("Only the booking owner or admin can cancel a booking");
        }
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Rejected bookings cannot be cancelled");
        }
        // Delete the booking when cancelled
        bookingRepository.delete(booking);
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = findBooking(id);
        User currentUser = authService.getCurrentUser();
        if (!booking.getRequestedBy().getId().equals(currentUser.getId()) &&
                !isAdmin(currentUser)) {
            throw new BadRequestException("Only the booking owner or admin can delete a booking");
        }
        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new BadRequestException("Approved bookings cannot be deleted");
        }
        bookingRepository.delete(booking);
    }

    public Page<CalendarEventDto> getCalendarEvents(LocalDate startDate, LocalDate endDate,
            Optional<BookingStatus> status, int page, int size) {
        User currentUser = authService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);

        Page<Booking> bookings;
        if (isAdmin(currentUser)) {
            if (status.isPresent()) {
                bookings = bookingRepository.findAllByDateBetweenAndStatus(startDate, endDate, status.get(), pageable);
            } else {
                bookings = bookingRepository.findAllByDateBetween(startDate, endDate, pageable);
            }
        } else {
            // For regular users, only show their own bookings with proper date range
            // filtering
            if (status.isPresent()) {
                bookings = bookingRepository.findAllByRequestedByAndDateBetweenAndStatus(currentUser, startDate,
                        endDate, status.get(), pageable);
            } else {
                bookings = bookingRepository.findAllByRequestedByAndDateBetween(currentUser, startDate, endDate,
                        pageable);
            }
        }

        return bookings.map(this::toCalendarEventDto);
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found"));
    }

    private void validateDateTime(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private void checkBookingConflict(String resourceId, LocalDate date,
            LocalTime startTime, LocalTime endTime) {
        boolean conflict = bookingRepository
                .existsByResourceIdAndStatusAndDateAndStartTimeLessThanAndEndTimeGreaterThan(
                        resourceId,
                        BookingStatus.APPROVED,
                        date,
                        endTime,
                        startTime);
        if (conflict) {
            throw new BadRequestException("Booking conflicts with an existing approved reservation");
        }
    }

    private BookingResponseDto toDto(Booking booking) {
        return BookingResponseDto.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .resourceType(booking.getResourceType())
                .location(booking.getLocation())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .adminReason(booking.getAdminReason())
                .requestedById(booking.getRequestedBy().getId())
                .requestedByEmail(booking.getRequestedBy().getEmail())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    public Page<BookingResponseDto> getMyBookings(int page, int size) {
        User currentUser = authService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, DATE_PROPERTY));
        return bookingRepository.findAllByRequestedBy(currentUser, pageable).map(this::toDto);
    }

    public Page<BookingResponseDto> getBookingsPendingApproval(int page, int size) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN &&
            currentUser.getRole() != Role.SUPER_ADMIN &&
            currentUser.getRole() != Role.HOD &&
            currentUser.getRole() != Role.FACILITY_MANAGER) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to view pending approvals");
        }
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.ASC, DATE_PROPERTY));
        return bookingRepository.findAllByStatus(BookingStatus.PENDING, pageable).map(this::toDto);
    }

    private CalendarEventDto toCalendarEventDto(Booking booking) {
        User currentUser = authService.getCurrentUser();
        boolean canModify = booking.getRequestedBy().getId().equals(currentUser.getId()) || isAdmin(currentUser);

        return CalendarEventDto.builder()
                .id(booking.getId())
                .title(booking.getResourceName() + " - " + booking.getPurpose())
                .start(java.time.LocalDateTime.of(booking.getDate(), booking.getStartTime()))
                .end(java.time.LocalDateTime.of(booking.getDate(), booking.getEndTime()))
                .resourceName(booking.getResourceName())
                .resourceType(booking.getResourceType())
                .location(booking.getLocation())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .requestedByEmail(booking.getRequestedBy().getEmail())
                .canModify(canModify)
                .build();
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;
    }

}
