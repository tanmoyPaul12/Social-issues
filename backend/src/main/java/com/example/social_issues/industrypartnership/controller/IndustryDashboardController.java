package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.service.IndustryDashboardService;
import com.example.social_issues.industrypartnership.service.MarketplaceService;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/industry/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class IndustryDashboardController {

    private final IndustryDashboardService dashboardService;
    private final AuthService authService;
    private final NotificationEventPublisher eventPublisher;
    private final MarketplaceService marketplaceService;

    public IndustryDashboardController(
            IndustryDashboardService dashboardService,
            AuthService authService,
            NotificationEventPublisher eventPublisher,
            MarketplaceService marketplaceService) {
        this.dashboardService = dashboardService;
        this.authService = authService;
        this.eventPublisher = eventPublisher;
        this.marketplaceService = marketplaceService;
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

    // ==========================================
    // Tab 2: University R&D Marketplace Endpoints
    // ==========================================

    /**
     * Filter and search marketplace R&D projects with multi-criteria filters & sorting
     */
    @GetMapping("/marketplace/projects")
    public ResponseEntity<?> searchMarketplaceProjects(
            @RequestParam(value = "domain", required = false) String domain,
            @RequestParam(value = "stage", required = false) String stage,
            @RequestParam(value = "university", required = false) String university,
            @RequestParam(value = "minFunding", required = false) BigDecimal minFunding,
            @RequestParam(value = "maxFunding", required = false) BigDecimal maxFunding,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sortBy", defaultValue = "NEWEST") String sortBy,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size
    ) {
        try {
            Page<MarketplaceProjectDto> results = marketplaceService.searchProjects(
                    domain, stage, university, minFunding, maxFunding, search, sortBy, page, size
            );
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get single project dossier
     */
    @GetMapping("/marketplace/projects/{id}")
    public ResponseEntity<?> getMarketplaceProjectById(@PathVariable("id") Long id) {
        try {
            MarketplaceProjectDto project = marketplaceService.getProjectById(id);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Action 1: Commit CSR co-funding to project
     */
    @PostMapping("/marketplace/projects/{id}/commit")
    public ResponseEntity<?> commitCsrFunding(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @Valid @RequestBody CommitFundingRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            MarketplaceProjectDto updated = marketplaceService.commitFunding(userId, id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "CSR Grant commitment registered successfully",
                    "project", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Action 2: Offer corporate mentorship to research team
     */
    @PostMapping("/marketplace/projects/{id}/mentor")
    public ResponseEntity<?> offerMentorship(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @Valid @RequestBody OfferMentorshipRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            marketplaceService.offerMentorship(userId, id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Corporate mentorship nomination dispatched to university team"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Action 3: Express letter of intent / interest
     */
    @PostMapping("/marketplace/projects/{id}/interest")
    public ResponseEntity<?> expressInterest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestBody ExpressInterestRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            marketplaceService.expressInterest(userId, id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Letter of intent dispatched to research team"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Dynamic aggregate filter metadata (universities list, sector counts, stage counts)
     */
    @GetMapping("/marketplace/meta")
    public ResponseEntity<?> getMarketplaceMeta() {
        try {
            MarketplaceMetaDto meta = marketplaceService.getMetadata();
            return ResponseEntity.ok(meta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
