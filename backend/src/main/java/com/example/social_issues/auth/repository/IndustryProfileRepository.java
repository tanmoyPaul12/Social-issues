package com.example.social_issues.auth.repository;

import com.example.social_issues.auth.model.IndustryProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IndustryProfileRepository extends JpaRepository<IndustryProfile, Long> {
    Optional<IndustryProfile> findByUserId(Long userId);
    Optional<IndustryProfile> findByGstin(String gstin);
}
