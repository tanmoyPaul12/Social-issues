package com.example.social_issues.auth.repository;

import com.example.social_issues.auth.model.UniversityProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniversityProfileRepository extends JpaRepository<UniversityProfile, Long> {
    Optional<UniversityProfile> findByUserId(Long userId);
    Optional<UniversityProfile> findByAisheCode(String aisheCode);
}
