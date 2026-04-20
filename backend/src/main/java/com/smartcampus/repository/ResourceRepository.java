package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

       @Query("SELECT r FROM Resource r WHERE " +
                     "(:type IS NULL OR r.type = :type) AND " +
                     "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
                     "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
                     "(:status IS NULL OR r.status = :status)")
       List<Resource> searchResources(@Param("type") String type,
                     @Param("location") String location,
                     @Param("minCapacity") Integer minCapacity,
                     @Param("status") ResourceStatus status);

       @Query("SELECT r FROM Resource r WHERE " +
                     "(:type IS NULL OR r.type = :type) AND " +
                     "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
                     "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
                     "(:status IS NULL OR r.status = :status)")
       Page<Resource> searchResourcesPaged(@Param("type") String type,
                     @Param("location") String location,
                     @Param("minCapacity") Integer minCapacity,
                     @Param("status") ResourceStatus status,
                     Pageable pageable);

       boolean existsByNameAndLocationIgnoreCase(String name, String location);

       List<Resource> findByStatus(ResourceStatus status);

       List<Resource> findByTypeIgnoreCase(String type);
}