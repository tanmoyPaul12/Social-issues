package com.example.social_issues.analytics.controller;

import com.example.social_issues.analytics.dto.AnalyticsDashboardResponse;
import com.example.social_issues.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Get platform-wide aggregated analytics for dashboard views.
     * Public endpoint matching /issues and /issues/stats.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDashboardResponse> getDashboardAnalytics() {
        AnalyticsDashboardResponse response = analyticsService.getDashboardAnalytics();
        return ResponseEntity.ok(response);
    }
}
