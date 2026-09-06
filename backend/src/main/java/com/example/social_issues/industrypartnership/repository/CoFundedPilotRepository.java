package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.CoFundedPilot;
import com.example.social_issues.industrypartnership.model.PilotHealthStatus;
import com.example.social_issues.industrypartnership.model.PilotStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CoFundedPilotRepository extends JpaRepository<CoFundedPilot, Long>, JpaSpecificationExecutor<CoFundedPilot> {

    List<CoFundedPilot> findByIndustryProfileId(Long industryProfileId);

    Page<CoFundedPilot> findByIndustryProfileId(Long industryProfileId, Pageable pageable);

    long countByIndustryProfileId(Long industryProfileId);

    long countByIndustryProfileIdAndStatus(Long industryProfileId, PilotStatus status);

    long countByIndustryProfileIdAndHealthStatus(Long industryProfileId, PilotHealthStatus healthStatus);

    @Query("""
        SELECT COUNT(p)
        FROM CoFundedPilot p
        WHERE p.industryProfile.id = :profileId AND p.status IN ('ACTIVE', 'MILESTONE_PENDING')
    """)
    int countActivePilotsByProfileId(@Param("profileId") Long profileId);

    @Query("""
        SELECT COUNT(p)
        FROM CoFundedPilot p
        WHERE p.industryProfile.id = :profileId AND p.status = 'MILESTONE_PENDING'
    """)
    int countPendingMilestonesByProfileId(@Param("profileId") Long profileId);

    @Query("""
        SELECT COALESCE(SUM(p.totalBudget), 0)
        FROM CoFundedPilot p
        WHERE p.industryProfile.id = :profileId AND p.status <> 'ON_HOLD'
    """)
    BigDecimal sumTotalBudgetByProfileId(@Param("profileId") Long profileId);

    @Query("""
        SELECT COALESCE(SUM(p.disbursedBudget), 0)
        FROM CoFundedPilot p
        WHERE p.industryProfile.id = :profileId AND p.status <> 'ON_HOLD'
    """)
    BigDecimal sumDisbursedBudgetByProfileId(@Param("profileId") Long profileId);
}
