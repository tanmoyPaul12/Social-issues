package com.example.social_issues.auth.repository;

import com.example.social_issues.auth.model.CitizenProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CitizenProfileRepository extends JpaRepository<CitizenProfile, Long> {
    Optional<CitizenProfile> findByUserId(Long userId);
}
