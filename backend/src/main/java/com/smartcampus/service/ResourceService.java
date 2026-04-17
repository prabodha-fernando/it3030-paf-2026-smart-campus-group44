package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public List<Resource> getAll() {
        return resourceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Resource getById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));
    }

    @Transactional
    public Resource create(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(parseStatus(request.getStatus()))
                .availabilityStart(request.getAvailabilityStart())
                .availabilityEnd(request.getAvailabilityEnd())
                .description(request.getDescription())
                .build();
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource update(Long id, ResourceRequest request) {
        Resource existingResource = getById(id);
        
        existingResource.setName(request.getName());
        existingResource.setType(request.getType());
        existingResource.setCapacity(request.getCapacity());
        existingResource.setLocation(request.getLocation());
        existingResource.setStatus(parseStatus(request.getStatus()));
        existingResource.setAvailabilityStart(request.getAvailabilityStart());
        existingResource.setAvailabilityEnd(request.getAvailabilityEnd());
        existingResource.setDescription(request.getDescription());

        return resourceRepository.save(existingResource);
    }

    @Transactional
    public void delete(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new EntityNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Resource> search(String type, String location, Integer minCapacity, String statusStr) {
        ResourceStatus status = parseStatus(statusStr);
        return resourceRepository.searchResources(type, location, minCapacity, status);
    }

    private ResourceStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return null;
        }
        try {
            return ResourceStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Default to something or throw custom exception, here we assume it could be null for mapping 
            // or pass it as null for search if invalid. But for safety, returning null or throwing.
            return null;
        }
    }
}
