package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.CoFundedPilot;
import com.example.social_issues.industrypartnership.model.PilotStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoFundedPilotRepository extends JpaRepository<CoFundedPilot, Long> {

    List<CoFundedPilot> findByIndustryProfileId(Long industryProfileId);

    Page<CoFundedPilot> findByIndustryProfileId(Long industryProfileId, Pageable pageable);

    long countByIndustryProfileId(Long industryProfileId);

    long countByIndustryProfileIdAndStatus(Long industryProfileId, PilotStatus status);

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
}
