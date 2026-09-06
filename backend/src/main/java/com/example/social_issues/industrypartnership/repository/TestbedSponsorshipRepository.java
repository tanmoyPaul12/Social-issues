package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.TestbedSponsorship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestbedSponsorshipRepository extends JpaRepository<TestbedSponsorship, Long> {

    List<TestbedSponsorship> findByIndustryProfileId(Long industryProfileId);

    int countByIndustryProfileId(Long industryProfileId);

    @Query("SELECT COUNT(DISTINCT t.district) FROM TestbedSponsorship t WHERE t.industryProfile.id = :profileId")
    int countDistinctDistrictsByProfileId(@Param("profileId") Long profileId);

    @Query("SELECT COALESCE(SUM(t.beneficiariesImpacted), 0) FROM TestbedSponsorship t WHERE t.industryProfile.id = :profileId")
    long sumBeneficiariesByProfileId(@Param("profileId") Long profileId);
}
