package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.ImpactSummaryDto;
import com.example.social_issues.industrypartnership.dto.QuarterlyTrendDto;
import com.example.social_issues.industrypartnership.dto.SectorEngagementDto;
import com.example.social_issues.industrypartnership.service.IndustryAnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/industry/dashboard/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class IndustryAnalyticsController {

    private final IndustryAnalyticsService analyticsService;
    private final AuthService authService;

    public IndustryAnalyticsController(IndustryAnalyticsService analyticsService, AuthService authService) {
        this.analyticsService = analyticsService;
        this.authService = authService;
    }

    private UserSummaryDto getAuthenticatedUser(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        try {
            return authService.getCurrentUser(token);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 1. Get high-level CSR impact and innovation summary metrics
     */
    @GetMapping("/impact-summary")
    public ResponseEntity<?> getImpactSummary(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access analytics"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            ImpactSummaryDto summary = analyticsService.getImpactSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 2. Get quarterly financial commitments vs disbursements time-series
     */
    @GetMapping("/financial-trend")
    public ResponseEntity<?> getFinancialTrends(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access analytics"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<QuarterlyTrendDto> trends = analyticsService.getQuarterlyFinancialTrends(userId);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 3. Get domain/sector wise CSR capital breakdown
     */
    @GetMapping("/domain-breakdown")
    public ResponseEntity<?> getDomainBreakdown(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access analytics"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<SectorEngagementDto> breakdown = analyticsService.getSectorWiseImpact(userId);
            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
