package com.example.social_issues.routing.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.model.Role;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.problemsubmission.dto.IssuePageResponse;
import com.example.social_issues.problemsubmission.dto.IssueResponse;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.routing.dto.TriageAssignRequest;
import com.example.social_issues.routing.dto.TriageRejectRequest;
import com.example.social_issues.routing.dto.TriageValidateRequest;
import com.example.social_issues.routing.service.RoutingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/triage")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class TriageController {

    private static final Logger log = LoggerFactory.getLogger(TriageController.class);

    private final RoutingService routingService;
    private final AuthService authService;

    public TriageController(RoutingService routingService, AuthService authService) {
        this.routingService = routingService;
        this.authService = authService;
    }

    /**
     * Get paginated triage queue for Nodal and Government officers
     * GET /api/triage/queue
     */
    @GetMapping("/queue")
    public ResponseEntity<?> getTriageQueue(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) IssueStatus status,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "sector", required = false) IssueSector sector,
            @RequestParam(value = "priority", required = false) IssuePriority priority,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size
    ) {
        UserSummaryDto user = getAuthenticatedNodalUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access Nodal Triage Queue"));
        }
        if (!isAuthorizedNodalRole(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Nodal Admin or Government role required"));
        }

        try {
            IssuePageResponse response = routingService.getTriageQueue(status, district, sector, priority, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching triage queue: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get unpaginated list of triage queue issues for dashboard feeds
     * GET /api/triage/queue/list
     */
    @GetMapping("/queue/list")
    public ResponseEntity<?> getTriageQueueList(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) IssueStatus status,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "sector", required = false) IssueSector sector,
            @RequestParam(value = "priority", required = false) IssuePriority priority
    ) {
        UserSummaryDto user = getAuthenticatedNodalUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access Nodal Triage Queue"));
        }
        if (!isAuthorizedNodalRole(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Nodal Admin or Government role required"));
        }

        try {
            List<IssueResponse> response = routingService.getTriageQueueList(status, district, sector, priority);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching triage queue list: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Validate and confirm citizen grievance
     * POST /api/triage/{id}/validate
     */
    @PostMapping("/{id}/validate")
    public ResponseEntity<?> validateIssue(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestBody(required = false) TriageValidateRequest request
    ) {
        UserSummaryDto user = getAuthenticatedNodalUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to validate issue"));
        }
        if (!isAuthorizedNodalRole(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Nodal Admin or Government role required"));
        }

        try {
            Long reviewerId = Long.parseLong(user.getId());
            IssueResponse response = routingService.validateAndConfirm(reviewerId, id, request != null ? request : new TriageValidateRequest());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error validating issue #{}: ", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Assign civic grievance to target University / HEI
     * POST /api/triage/{id}/assign
     */
    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assignIssueToHEI(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @Valid @RequestBody TriageAssignRequest request
    ) {
        UserSummaryDto user = getAuthenticatedNodalUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to assign issue to HEI"));
        }
        if (!isAuthorizedNodalRole(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Nodal Admin or Government role required"));
        }

        try {
            Long reviewerId = Long.parseLong(user.getId());
            IssueResponse response = routingService.assignToHEI(reviewerId, id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error assigning issue #{} to HEI: ", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject civic grievance with reason
     * POST /api/triage/{id}/reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectIssue(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestBody(required = false) TriageRejectRequest request
    ) {
        UserSummaryDto user = getAuthenticatedNodalUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to reject issue"));
        }
        if (!isAuthorizedNodalRole(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Nodal Admin or Government role required"));
        }

        try {
            Long reviewerId = Long.parseLong(user.getId());
            IssueResponse response = routingService.rejectIssue(reviewerId, id, request != null ? request : new TriageRejectRequest());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error rejecting issue #{}: ", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private UserSummaryDto getAuthenticatedNodalUser(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        return authService.getCurrentUser(authHeader);
    }

    private boolean isAuthorizedNodalRole(Role role) {
        if (role == null) return false;
        return role == Role.GOVERNMENT ||
               role == Role.PRI_OFFICIAL ||
               role == Role.NODAL_ADMIN ||
               role == Role.ADMIN ||
               role == Role.PLATFORM_ADMIN;
    }
}
