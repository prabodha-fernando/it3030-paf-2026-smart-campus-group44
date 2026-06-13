package com.smartcampus.repository;

import com.smartcampus.model.RoleRequest;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {

    List<RoleRequest> findAllByOrderByCreatedAtDesc();

    List<RoleRequest> findByUserOrderByCreatedAtDesc(User user);

    List<RoleRequest> findByStatusOrderByCreatedAtDesc(String status);

    Optional<RoleRequest> findByUserAndStatus(User user, String status);

    boolean existsByUserAndStatus(User user, String status);


    
}
