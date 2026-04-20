package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j // Added for professional server logging
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public List<Resource> getAll() {
        log.info("Fetching all campus resources");
        return resourceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Resource getById(Long id) {
        log.info("Fetching resource with ID: {}", id);
        return resourceRepository.findById(id)
                // CRITICAL FIX: Maps directly to a 404 Not Found instead of crashing with a 500
                .orElseThrow(() -> {
                    log.warn("Resource lookup failed. ID {} not found.", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found with ID: " + id);
                });
    }

    @Transactional
    public Resource create(ResourceRequest request) {
        log.info("Creating new resource: {}", request.getName());
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(parseStatusStrict(request.getStatus())) // Fixed parsing logic
                .availabilityStart(request.getAvailabilityStart())
                .availabilityEnd(request.getAvailabilityEnd())
                .description(request.getDescription())
                .build();
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource update(Long id, ResourceRequest request) {
        log.info("Updating resource with ID: {}", id);
        Resource existingResource = getById(id);

        existingResource.setName(request.getName());
        existingResource.setType(request.getType());
        existingResource.setCapacity(request.getCapacity());
        existingResource.setLocation(request.getLocation());
        existingResource.setStatus(parseStatusStrict(request.getStatus())); // Fixed parsing logic
        existingResource.setAvailabilityStart(request.getAvailabilityStart());
        existingResource.setAvailabilityEnd(request.getAvailabilityEnd());
        existingResource.setDescription(request.getDescription());

        return resourceRepository.save(existingResource);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Attempting to delete resource with ID: {}", id);
        if (!resourceRepository.existsById(id)) {
            log.warn("Deletion failed. Resource ID {} does not exist.", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found with ID: " + id);
        }
        resourceRepository.deleteById(id);
        log.info("Successfully deleted resource ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<Resource> search(String type, String location, Integer minCapacity, String statusStr) {
        log.info("Executing resource search query...");
        ResourceStatus status = parseStatusLenient(statusStr);
        return resourceRepository.searchResources(type, location, minCapacity, status);
    }

    // --- HELPER METHODS ---

    /**
     * Used for Creating/Updating. Throws a 400 Bad Request if the frontend sends an
     * invalid status string.
     */
    private ResourceStatus parseStatusStrict(String statusStr) {
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return ResourceStatus.ACTIVE; // Provide a safe default
        }
        try {
            return ResourceStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid status string received: {}", statusStr);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid resource status provided.");
        }
    }

    /**
     * Used for Searching. Fails silently (returns null) so the search doesn't crash
     * if the query is malformed.
     */
    private ResourceStatus parseStatusLenient(String statusStr) {
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return null;
        }
        try {
            return ResourceStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}