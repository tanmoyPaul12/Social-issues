package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.DisbursementStatus;
import com.example.social_issues.industrypartnership.model.PilotDisbursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PilotDisbursementRepository extends JpaRepository<PilotDisbursement, Long> {

    List<PilotDisbursement> findByPilotIdOrderByTrancheNumberAsc(Long pilotId);

    List<PilotDisbursement> findByPilotIdAndStatus(Long pilotId, DisbursementStatus status);

    @Query("""
        SELECT COALESCE(SUM(d.amount), 0)
        FROM PilotDisbursement d
        WHERE d.pilot.id = :pilotId AND d.status = 'DISBURSED'
    """)
    BigDecimal sumDisbursedAmountByPilotId(@Param("pilotId") Long pilotId);

    @Query("""
        SELECT d FROM PilotDisbursement d
        WHERE d.pilot.industryProfile.id = :profileId
        ORDER BY d.id DESC
    """)
    List<PilotDisbursement> findByIndustryProfileId(@Param("profileId") Long profileId);
}
