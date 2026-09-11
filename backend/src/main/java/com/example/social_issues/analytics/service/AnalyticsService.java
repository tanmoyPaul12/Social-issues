package com.example.social_issues.analytics.service;

import com.example.social_issues.analytics.dto.AnalyticsDashboardResponse;

public interface AnalyticsService {

    /**
     * Aggregates and returns high-level platform analytics across all grassroot issues.
     *
     * @return AnalyticsDashboardResponse containing totals, distributions, breakdowns, trends, and rates.
     */
    AnalyticsDashboardResponse getDashboardAnalytics();
}
