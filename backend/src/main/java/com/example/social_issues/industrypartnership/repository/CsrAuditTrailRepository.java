package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.CsrAuditTrail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CsrAuditTrailRepository extends JpaRepository<CsrAuditTrail, Long> {

    Page<CsrAuditTrail> findByIndustryProfileIdOrderByTimestampDesc(Long industryProfileId, Pageable pageable);

    Page<CsrAuditTrail> findByIndustryProfileIdAndFinancialYearOrderByTimestampDesc(
            Long industryProfileId, String financialYear, Pageable pageable);

    @Query("SELECT a FROM CsrAuditTrail a WHERE a.industryProfile.id = :profileId ORDER BY a.id DESC LIMIT 1")
    Optional<CsrAuditTrail> findLatestByProfileId(@Param("profileId") Long profileId);
}
