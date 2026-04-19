package com.smartcampus.controller;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.model.Resource;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j // Adds professional enterprise logging capabilities
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url}")
public class ResourceController {

    private final ResourceService resourceService;

    // ========================================================================
    // ENDPOINT 1: List all resources
    // Method: GET | URL: /api/resources
    // ========================================================================
    @GetMapping
    public ResponseEntity<List<Resource>> getAll() {
        log.info("REST request to fetch all facilities and resources");
        return ResponseEntity.ok(resourceService.getAll());
    }

    // ========================================================================
    // ENDPOINT 2: Get resource by ID
    // Method: GET | URL: /api/resources/{id}
    // ========================================================================
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable Long id) {
        log.info("REST request to fetch resource with ID: {}", id);
        return ResponseEntity.ok(resourceService.getById(id));
    }

    // ========================================================================
    // ENDPOINT 3: Filter by type/location/capacity/status
    // Method: GET | URL: /api/resources/search
    // ========================================================================
    @GetMapping("/search")
    public ResponseEntity<List<Resource>> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String status) {

        log.info("REST request to search resources | Type: {}, Location: {}, MinCapacity: {}, Status: {}",
                type, location, minCapacity, status);

        return ResponseEntity.ok(resourceService.search(type, location, minCapacity, status));
    }

    // ========================================================================
    // ENDPOINT 4: Create resource (ADMIN)
    // Method: POST | URL: /api/resources
    // ========================================================================
    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')") // TODO: Re-enable this before your final
    // university submission!
    public ResponseEntity<Resource> create(@Valid @RequestBody ResourceRequest request) {
        log.info("REST request to create new resource: {}", request.getName());
        Resource created = resourceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ========================================================================
    // ENDPOINT 5: Update resource (ADMIN)
    // Method: PUT | URL: /api/resources/{id}
    // ========================================================================
    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // TODO: Re-enable this before your final
    // university submission!
    public ResponseEntity<Resource> update(@PathVariable Long id, @Valid @RequestBody ResourceRequest request) {
        log.info("REST request to update resource with ID: {}", id);
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    // ========================================================================
    // ENDPOINT 6: Delete resource (ADMIN)
    // Method: DELETE | URL: /api/resources/{id}
    // ========================================================================
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // TODO: Re-enable this before your final
    // university submission!
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.warn("REST request to DELETE resource with ID: {}", id);
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}