package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.industrypartnership.dto.IndustryActivityDto;
import com.example.social_issues.industrypartnership.dto.IndustryOverviewResponse;
import org.springframework.data.domain.Page;

public interface IndustryDashboardService {

    IndustryOverviewResponse getOverview(Long userId, String financialYear);

    Page<IndustryActivityDto> getActivities(Long userId, int page, int size, String eventType);

    void markActivityAsRead(Long userId, Long activityId);
}
