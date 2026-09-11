package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.LogMentorshipSessionRequest;
import com.example.social_issues.industrypartnership.dto.MentorshipEngagementDto;
import com.example.social_issues.industrypartnership.dto.OfferMentorshipRequest;
import com.example.social_issues.industrypartnership.model.MentorshipStatus;
import com.example.social_issues.industrypartnership.service.MentorshipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/industry/dashboard/mentorships")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class MentorshipController {

    private final MentorshipService mentorshipService;
    private final AuthService authService;

    public MentorshipController(MentorshipService mentorshipService, AuthService authService) {
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
        if (user == null || user.getId() == null) return null;
        try {
            return Long.valueOf(user.getId());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 1. Get list of mentorship engagements for the industry partner
     */
    @GetMapping
    public ResponseEntity<?> getMentorships(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) String statusStr
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        MentorshipStatus status = null;
        if (statusStr != null && !statusStr.isBlank() && !statusStr.equalsIgnoreCase("ALL")) {
            try {
                status = MentorshipStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status and return all
            }
        }

        List<MentorshipEngagementDto> list = mentorshipService.getMentorshipEngagements(getUserId(user), status);
        return ResponseEntity.ok(list);
    }

    /**
     * 2. Get detailed mentorship engagement by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getMentorshipDetail(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            MentorshipEngagementDto dto = mentorshipService.getMentorshipDetail(getUserId(user), id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 3. Offer mentorship for a marketplace project
     */
    @PostMapping("/offer/{projectId}")
    public ResponseEntity<?> offerMentorship(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody OfferMentorshipRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            MentorshipEngagementDto dto = mentorshipService.offerMentorship(getUserId(user), projectId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 4. Update mentorship lifecycle status (e.g. ACTIVE, PAUSED, COMPLETED)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        try {
            MentorshipStatus status = MentorshipStatus.valueOf(statusStr.toUpperCase());
            MentorshipEngagementDto dto = mentorshipService.updateMentorshipStatus(getUserId(user), id, status);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value: " + statusStr));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 5. Log a completed mentorship session and update notes / next session date
     */
    @PostMapping("/{id}/session")
    public ResponseEntity<?> logSession(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestBody LogMentorshipSessionRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            MentorshipEngagementDto dto = mentorshipService.logSession(getUserId(user), id, request);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}
