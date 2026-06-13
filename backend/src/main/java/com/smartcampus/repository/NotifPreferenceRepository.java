package com.smartcampus.repository;

import com.smartcampus.model.NotifPreference;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface NotifPreferenceRepository extends JpaRepository<NotifPreference, Long> {

    Optional<NotifPreference> findByUser(User user);
    
}
