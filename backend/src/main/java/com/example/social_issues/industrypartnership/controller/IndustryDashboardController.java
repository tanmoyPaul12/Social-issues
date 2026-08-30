package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;

import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.IndustryActivityDto;
import com.example.social_issues.industrypartnership.dto.IndustryOverviewResponse;
import com.example.social_issues.industrypartnership.service.IndustryDashboardService;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/industry/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class IndustryDashboardController {

    private final IndustryDashboardService dashboardService;
    private final AuthService authService;
    private final NotificationEventPublisher eventPublisher;

    public IndustryDashboardController(
            IndustryDashboardService dashboardService,
            AuthService authService,
            NotificationEventPublisher eventPublisher) {
        this.dashboardService = dashboardService;
        this.authService = authService;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Tab 1: Get consolidated overview metrics, stat cards, compliance, and activities
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "financialYear", required = false) String financialYear
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access industry dashboard"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            IndustryOverviewResponse response = dashboardService.getOverview(userId, financialYear);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get paginated activity stream
     */
    @GetMapping("/activities")
    public ResponseEntity<?> getActivities(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "eventType", required = false) String eventType
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long userId = Long.parseLong(user.getId());
            Page<IndustryActivityDto> activities = dashboardService.getActivities(userId, page, size, eventType);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark an activity log item as read
     */
    @PatchMapping("/activities/{id}/read")
    public ResponseEntity<?> markActivityAsRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long userId = Long.parseLong(user.getId());
            dashboardService.markActivityAsRead(userId, id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Activity marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Trigger a real-time event through Redis to verify event-driven notifications
     */
    @PostMapping("/test-notification")
    public ResponseEntity<?> sendTestNotification(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) Map<String, Object> payload
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        Long userId = user != null ? Long.parseLong(user.getId()) : 1L;

        NotificationEvent event = new NotificationEvent();
        event.setEventType("MILESTONE_DELIVERABLE_UPLOADED");
        event.setSource("backend.industrypartnership");
        event.setRecipientUserId(userId);
        event.setRecipientUserType("INDUSTRY_PARTNER");
        event.setTitle(payload != null && payload.containsKey("title") ? (String) payload.get("title") : "New Milestone 2 Deliverable from BIT Mesra");
        event.setMessage(payload != null && payload.containsKey("message") ? (String) payload.get("message") : "Telemetry telemetry data submitted for Soil Salinity IoT Project.");
        event.setSeverity("ACTION_REQUIRED");
        event.setActionUrl("/dashboard/industry/projects/42");

        eventPublisher.publishIndustryNotification(event);
        return ResponseEntity.ok(Map.of("success", true, "message", "Event published to Redis Pub/Sub successfully", "event", event));
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
}
