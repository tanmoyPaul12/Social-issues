package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.MarketplaceEngagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceEngagementRepository extends JpaRepository<MarketplaceEngagement, Long> {

    List<MarketplaceEngagement> findByIndustryProfileIdOrderByCreatedAtDesc(Long industryProfileId);

    List<MarketplaceEngagement> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    boolean existsByProjectIdAndIndustryProfileId(Long projectId, Long industryProfileId);
}
