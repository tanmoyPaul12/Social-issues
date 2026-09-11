package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.industrypartnership.dto.ImpactSummaryDto;
import com.example.social_issues.industrypartnership.dto.QuarterlyTrendDto;
import com.example.social_issues.industrypartnership.dto.SectorEngagementDto;

import java.util.List;

public interface IndustryAnalyticsService {

    ImpactSummaryDto getImpactSummary(Long userId);

    List<QuarterlyTrendDto> getQuarterlyFinancialTrends(Long userId);

    List<SectorEngagementDto> getSectorWiseImpact(Long userId);
}
