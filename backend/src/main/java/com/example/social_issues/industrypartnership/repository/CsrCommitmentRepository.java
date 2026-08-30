package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.dto.SectorEngagementDto;
import com.example.social_issues.industrypartnership.model.CsrCommitment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CsrCommitmentRepository extends JpaRepository<CsrCommitment, Long> {

    List<CsrCommitment> findByIndustryProfileId(Long industryProfileId);

    @Query("""
        SELECT COALESCE(SUM(c.totalCommittedAmount), 0)
        FROM CsrCommitment c
        WHERE c.industryProfile.id = :profileId AND c.status <> 'CANCELLED'
    """)
    BigDecimal sumTotalCommittedAmountByProfileId(@Param("profileId") Long profileId);

    @Query("""
        SELECT COALESCE(SUM(c.totalDisbursedAmount), 0)
        FROM CsrCommitment c
        WHERE c.industryProfile.id = :profileId AND c.status <> 'CANCELLED'
    """)
    BigDecimal sumTotalDisbursedAmountByProfileId(@Param("profileId") Long profileId);

    @Query("""
        SELECT new com.example.social_issues.industrypartnership.dto.SectorEngagementDto(
            c.pilot.sector,
            COUNT(c.id),
            SUM(c.totalCommittedAmount)
        )
        FROM CsrCommitment c
        WHERE c.industryProfile.id = :profileId AND c.pilot IS NOT NULL AND c.status <> 'CANCELLED'
        GROUP BY c.pilot.sector
    """)
    List<SectorEngagementDto> getSectorWiseBreakdownByProfileId(@Param("profileId") Long profileId);
}
