package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.CorporateNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CorporateNotificationPreferenceRepository extends JpaRepository<CorporateNotificationPreference, Long> {

    Optional<CorporateNotificationPreference> findByIndustryProfileId(Long industryProfileId);

    boolean existsByIndustryProfileId(Long industryProfileId);
}
