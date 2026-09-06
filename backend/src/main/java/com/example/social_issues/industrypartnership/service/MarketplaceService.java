package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.industrypartnership.dto.*;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface MarketplaceService {

    Page<MarketplaceProjectDto> searchProjects(
            String domain,
            String stage,
            String university,
            BigDecimal minFunding,
            BigDecimal maxFunding,
            String search,
            String sortBy,
            int page,
            int size
    );

    MarketplaceProjectDto getProjectById(Long id);

    MarketplaceProjectDto commitFunding(Long userId, Long projectId, CommitFundingRequest request);

    void offerMentorship(Long userId, Long projectId, OfferMentorshipRequest request);

    void expressInterest(Long userId, Long projectId, ExpressInterestRequest request);

    MarketplaceMetaDto getMetadata();
}
