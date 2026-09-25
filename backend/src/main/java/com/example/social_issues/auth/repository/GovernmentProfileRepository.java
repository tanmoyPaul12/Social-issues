package com.example.social_issues.auth.repository;

import com.example.social_issues.auth.model.GovernmentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GovernmentProfileRepository extends JpaRepository<GovernmentProfile, Long> {
    Optional<GovernmentProfile> findByUserId(Long userId);
    Optional<GovernmentProfile> findByServiceCode(String serviceCode);
    Optional<GovernmentProfile> findByDistrictIgnoreCase(String district);
    boolean existsByDistrictIgnoreCase(String district);
    Optional<GovernmentProfile> findByIsStateSuperAdminTrue();
    boolean existsByIsStateSuperAdminTrue();
}
