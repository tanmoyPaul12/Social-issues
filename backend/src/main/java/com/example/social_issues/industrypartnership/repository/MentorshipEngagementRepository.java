package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.MentorshipEngagement;
import com.example.social_issues.industrypartnership.model.MentorshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorshipEngagementRepository extends JpaRepository<MentorshipEngagement, Long> {

    List<MentorshipEngagement> findByIndustryProfileId(Long industryProfileId);

    List<MentorshipEngagement> findByIndustryProfileIdAndStatus(Long industryProfileId, MentorshipStatus status);

    List<MentorshipEngagement> findByMarketplaceProjectId(Long marketplaceProjectId);

    Optional<MentorshipEngagement> findByMarketplaceProjectIdAndIndustryProfileId(Long marketplaceProjectId, Long industryProfileId);

    long countByIndustryProfileId(Long industryProfileId);

    long countByIndustryProfileIdAndStatus(Long industryProfileId, MentorshipStatus status);

    @Query("SELECT COUNT(m) FROM MentorshipEngagement m WHERE m.industryProfile.id = :profileId AND m.status = 'ACTIVE'")
    long countActiveMentorships(@Param("profileId") Long profileId);

    @Query("SELECT SUM(m.sessionCount) FROM MentorshipEngagement m WHERE m.industryProfile.id = :profileId")
    Long sumTotalSessionsByProfileId(@Param("profileId") Long profileId);
}
