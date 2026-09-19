package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.MentorshipStatus;
import com.example.social_issues.industrypartnership.service.MarketplaceService;
import com.example.social_issues.industrypartnership.service.MentorshipService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/industry")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class IndustryMarketplaceController {

    private static final Logger log = LoggerFactory.getLogger(IndustryMarketplaceController.class);

    private final MarketplaceService marketplaceService;
    private final MentorshipService mentorshipService;
    private final AuthService authService;

    public IndustryMarketplaceController(
            MarketplaceService marketplaceService,
            MentorshipService mentorshipService,
            AuthService authService
    ) {
        this.marketplaceService = marketplaceService;
        this.mentorshipService = mentorshipService;
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

    private Long getUserId(UserSummaryDto user) {
        if (user == null || user.getId() == null) return 1L;
        try {
            return Long.valueOf(user.getId());
        } catch (NumberFormatException e) {
            return 1L;
        }
    }

    /**
     * 1. Explore Challenges & Academic R&D Marketplace
     * GET /api/industry/marketplace
     */
    @GetMapping("/marketplace")
    public ResponseEntity<?> getMarketplace(
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
        log.info("API: GET /api/industry/marketplace - domain: {}, stage: {}, search: {}", domain, stage, search);
        Page<MarketplaceProjectDto> results = marketplaceService.searchProjects(
                domain, stage, university, minFunding, maxFunding, search, sortBy, page, size
        );
        return ResponseEntity.ok(results);
    }

    /**
     * 2. Get single project dossier
     * GET /api/industry/marketplace/{id}
     */
    @GetMapping("/marketplace/{id}")
    public ResponseEntity<?> getMarketplaceProjectById(@PathVariable("id") Long id) {
        try {
            MarketplaceProjectDto project = marketplaceService.getProjectById(id);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 3. Express Interest / Commit Funding to a Challenge
     * POST /api/industry/commitments
     */
    @PostMapping("/commitments")
    public ResponseEntity<?> createCommitment(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CommitFundingRequest request,
            @RequestParam(value = "projectId", required = false) Long queryProjectId
    ) {
        Long targetProjectId = request.getProjectId() != null ? request.getProjectId() : queryProjectId;
        if (targetProjectId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Target projectId is required for grant commitment"));
        }

        UserSummaryDto user = getAuthenticatedUser(authHeader);
        Long userId = getUserId(user);

        log.info("API: POST /api/industry/commitments - User {} committing ₹{} to Project {}",
                userId, request.getGrantAmount(), targetProjectId);

        MarketplaceProjectDto updated = marketplaceService.commitFunding(userId, targetProjectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "CSR Grant commitment registered successfully",
                "commitment", updated
        ));
    }

    /**
     * 4. List Mentorship Engagements
     * GET /api/industry/mentorship
     */
    @GetMapping("/mentorship")
    public ResponseEntity<?> getMentorships(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) String statusStr
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        Long userId = getUserId(user);

        MentorshipStatus status = null;
        if (statusStr != null && !statusStr.isBlank() && !statusStr.equalsIgnoreCase("ALL")) {
            try {
                status = MentorshipStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        List<MentorshipEngagementDto> list = mentorshipService.getMentorshipEngagements(userId, status);
        return ResponseEntity.ok(list);
    }

    /**
     * 5. Offer Corporate Mentorship
     * POST /api/industry/mentorship
     */
    @PostMapping("/mentorship")
    public ResponseEntity<?> offerMentorship(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody OfferMentorshipRequest request,
            @RequestParam(value = "projectId", required = false) Long queryProjectId
    ) {
        Long targetProjectId = request.getProjectId() != null ? request.getProjectId() : queryProjectId;
        if (targetProjectId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Target projectId is required to offer mentorship"));
        }

        UserSummaryDto user = getAuthenticatedUser(authHeader);
        Long userId = getUserId(user);

        log.info("API: POST /api/industry/mentorship - User {} offering mentorship for Project {}",
                userId, targetProjectId);

        MentorshipEngagementDto dto = mentorshipService.offerMentorship(userId, targetProjectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Corporate mentorship nomination dispatched to university team",
                "mentorship", dto
        ));
    }

    /**
     * 6. Get Marketplace Metadata
     * GET /api/industry/marketplace/meta
     */
    @GetMapping("/marketplace/meta")
    public ResponseEntity<?> getMarketplaceMeta() {
        return ResponseEntity.ok(marketplaceService.getMetadata());
    }
}
