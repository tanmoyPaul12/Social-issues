package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.AgreementStatus;
import com.example.social_issues.industrypartnership.model.CoDevelopmentAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoDevelopmentAgreementRepository extends JpaRepository<CoDevelopmentAgreement, Long> {

    List<CoDevelopmentAgreement> findByIndustryProfileId(Long industryProfileId);

    List<CoDevelopmentAgreement> findByIndustryProfileIdAndStatus(Long industryProfileId, AgreementStatus status);

    List<CoDevelopmentAgreement> findByPilotId(Long pilotId);

    List<CoDevelopmentAgreement> findByUniversityId(Long universityId);

    long countByIndustryProfileId(Long industryProfileId);

    long countByIndustryProfileIdAndStatus(Long industryProfileId, AgreementStatus status);

    @Query("SELECT COUNT(a) FROM CoDevelopmentAgreement a WHERE a.industryProfile.id = :profileId AND a.status = 'FULLY_EXECUTED'")
    long countExecutedAgreements(@Param("profileId") Long profileId);
}
