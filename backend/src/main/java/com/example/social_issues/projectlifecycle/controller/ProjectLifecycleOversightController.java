package com.example.social_issues.projectlifecycle.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.projectlifecycle.dto.ApprovalSignoffDto;
import com.example.social_issues.projectlifecycle.dto.DeliverableDto;
import com.example.social_issues.projectlifecycle.dto.ProjectLifecycleDossierDto;
import com.example.social_issues.projectlifecycle.dto.SubmitSignoffRequest;
import com.example.social_issues.projectlifecycle.service.ProjectLifecycleOversightService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class ProjectLifecycleOversightController {

    private static final Logger log = LoggerFactory.getLogger(ProjectLifecycleOversightController.class);

    private final ProjectLifecycleOversightService oversightService;
    private final AuthService authService;

    public ProjectLifecycleOversightController(
            ProjectLifecycleOversightService oversightService,
            AuthService authService
    ) {
        this.oversightService = oversightService;
        this.authService = authService;
    }

    private UserSummaryDto getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            return authService.getCurrentUser(authHeader.substring(7));
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 1. Get all active R&D projects statewide with filtering & pagination (Government & Nodal Oversight)
     * GET /api/projects?district=Ranchi&domain=Water&stage=PROTOTYPING&search=arsenic&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getProjectsOversight(
            @RequestParam(value = "aisheCode", required = false) String aisheCode,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "domain", required = false) String domain,
            @RequestParam(value = "stage", required = false) String stage,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir
    ) {
        log.info("API: GET /api/projects - district: {}, domain: {}, stage: {}, search: {}, page: {}, size: {}",
                district, domain, stage, search, page, size);
        if (page != null || size != null) {
            int pageNum = page != null ? Math.max(0, page) : 0;
            int pageSize = size != null ? Math.min(100, Math.max(1, size)) : 10;
            Pageable pageable = PageRequest.of(pageNum, pageSize,
                    Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy));
            return ResponseEntity.ok(oversightService.getProjectsOversightPaginated(aisheCode, district, domain, stage, search, pageable));
        }
        return ResponseEntity.ok(oversightService.getProjectsOversight(aisheCode, district, domain, stage, search));
    }

    /**
     * 2. Get 360-degree consolidated project dossier (milestones, test bench results, signoffs, IP)
     * GET /api/projects/{projectId}/dossier
     */
    @GetMapping("/{projectId}/dossier")
    public ResponseEntity<ProjectLifecycleDossierDto> getProjectDossier(@PathVariable("projectId") Long projectId) {
        log.info("API: GET /api/projects/{}/dossier", projectId);
        return ResponseEntity.ok(oversightService.getProjectDossier(projectId));
    }

    /**
     * 3. Find project associated with a Grassroot Issue
     * GET /api/projects/by-issue/{issueId}
     */
    @GetMapping("/by-issue/{issueId}")
    public ResponseEntity<?> getProjectByIssueId(@PathVariable("issueId") Long issueId) {
        log.info("API: GET /api/projects/by-issue/{}", issueId);
        return oversightService.getProjectByIssueId(issueId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No active R&D project associated with issue ID: " + issueId)));
    }

    /**
     * 4. Record official Government Nodal Officer stage approval / clearance
     * POST /api/projects/{projectId}/nodal-signoff
     */
    @PostMapping("/{projectId}/nodal-signoff")
    public ResponseEntity<ApprovalSignoffDto> recordNodalSignoff(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody SubmitSignoffRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        Long nodalUserId = user != null && user.getId() != null ? Long.parseLong(user.getId()) : null;
        String nodalOfficerName = user != null && user.getName() != null ? user.getName() : "State Nodal Officer";

        log.info("API: POST /api/projects/{}/nodal-signoff by officer '{}'", projectId, nodalOfficerName);
        ApprovalSignoffDto signoff = oversightService.recordNodalSignoff(projectId, request, nodalUserId, nodalOfficerName);
        return ResponseEntity.status(HttpStatus.CREATED).body(signoff);
    }

    /**
     * 5. Review / Approve milestone deliverable item (technical spec, field report, CAD, etc.)
     * PATCH /api/projects/{projectId}/deliverables/{deliverableId}/review
     */
    @PatchMapping("/{projectId}/deliverables/{deliverableId}/review")
    public ResponseEntity<DeliverableDto> reviewDeliverable(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("projectId") Long projectId,
            @PathVariable("deliverableId") Long deliverableId,
            @RequestParam("isApproved") Boolean isApproved,
            @RequestParam(value = "reviewNotes", required = false) String reviewNotes
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        Long reviewerId = user != null && user.getId() != null ? Long.parseLong(user.getId()) : null;

        log.info("API: PATCH /api/projects/{}/deliverables/{}/review approved={}", projectId, deliverableId, isApproved);
        DeliverableDto deliverable = oversightService.reviewDeliverable(deliverableId, isApproved, reviewNotes, reviewerId);
        return ResponseEntity.ok(deliverable);
    }
}
