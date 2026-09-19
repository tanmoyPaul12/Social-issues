package com.example.social_issues.projectlifecycle.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.projectlifecycle.dto.*;
import com.example.social_issues.projectlifecycle.service.ProjectMilestoneService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/projects/{projectId}/milestones", "/milestones/{projectId}"})
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class ProjectMilestoneController {

    private static final Logger log = LoggerFactory.getLogger(ProjectMilestoneController.class);

    private final ProjectMilestoneService milestoneService;
    private final AuthService authService;

    public ProjectMilestoneController(ProjectMilestoneService milestoneService, AuthService authService) {
        this.milestoneService = milestoneService;
        this.authService = authService;
    }

    /**
     * 1. Get all milestones and deliverables for a project / workspace
     * GET /api/projects/{projectId}/milestones
     * GET /api/milestones/{workspaceId}
     */
    @GetMapping
    public ResponseEntity<List<MilestoneDto>> getProjectMilestones(@PathVariable("projectId") Long projectId) {
        return ResponseEntity.ok(milestoneService.getProjectMilestones(projectId));
    }

    /**
     * 2. Initialize default 4-stage TRL milestone roadmap for a project
     * POST /api/projects/{projectId}/milestones/init-roadmap
     * POST /api/projects/{projectId}/milestones/setup-defaults
     * POST /api/milestones/{workspaceId}/setup-defaults
     */
    @PostMapping({"/init-roadmap", "/setup-defaults"})
    public ResponseEntity<List<MilestoneDto>> initDefaultRoadmap(@PathVariable("projectId") Long projectId) {
        log.info("API: Initializing default milestone roadmap for project ID: {}", projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(milestoneService.setupDefaultMilestones(projectId));
    }

    /**
     * 3. Create a custom milestone for a project
     * POST /api/projects/{projectId}/milestones
     */
    @PostMapping
    public ResponseEntity<MilestoneDto> createMilestone(
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody CreateMilestoneRequest request
    ) {
        log.info("API: Creating milestone #{} for project ID: {}", request.getMilestoneNumber(), projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(milestoneService.createMilestone(projectId, request));
    }

    /**
     * 4. Get a single milestone by ID
     * GET /api/projects/{projectId}/milestones/{milestoneId}
     */
    @GetMapping("/{milestoneId}")
    public ResponseEntity<MilestoneDto> getMilestoneById(
            @PathVariable("projectId") Long projectId,
            @PathVariable("milestoneId") Long milestoneId
    ) {
        return ResponseEntity.ok(milestoneService.getMilestoneById(milestoneId));
    }

    /**
     * 5. Submit deliverable artifact under a milestone
     * POST /api/projects/{projectId}/milestones/{milestoneId}/deliverables
     */
    @PostMapping("/{milestoneId}/deliverables")
    public ResponseEntity<DeliverableDto> submitDeliverable(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("projectId") Long projectId,
            @PathVariable("milestoneId") Long milestoneId,
            @Valid @RequestBody SubmitDeliverableRequest request
    ) {
        Long submitterId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                UserSummaryDto user = authService.getCurrentUser(authHeader.substring(7));
                if (user != null && user.getId() != null) {
                    submitterId = Long.parseLong(user.getId());
                }
            } catch (Exception ignored) {}
        }

        log.info("API: Submitting deliverable '{}' for milestone ID: {}", request.getTitle(), milestoneId);
        return ResponseEntity.status(HttpStatus.CREATED).body(milestoneService.submitDeliverable(milestoneId, request, submitterId));
    }

    /**
     * 6. Review / Approve / Reject a milestone
     * PATCH /api/projects/{projectId}/milestones/{milestoneId}/review
     */
    @PatchMapping("/{milestoneId}/review")
    public ResponseEntity<MilestoneDto> reviewMilestone(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("projectId") Long projectId,
            @PathVariable("milestoneId") Long milestoneId,
            @Valid @RequestBody ReviewMilestoneRequest request
    ) {
        Long reviewerId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                UserSummaryDto user = authService.getCurrentUser(authHeader.substring(7));
                if (user != null && user.getId() != null) {
                    reviewerId = Long.parseLong(user.getId());
                }
            } catch (Exception ignored) {}
        }

        log.info("API: Reviewing milestone ID: {} -> status: {}", milestoneId, request.getStatus());
        return ResponseEntity.ok(milestoneService.reviewMilestone(milestoneId, request, reviewerId));
    }

    /**
     * 7. Delete a milestone
     * DELETE /api/projects/{projectId}/milestones/{milestoneId}
     */
    @DeleteMapping("/{milestoneId}")
    public ResponseEntity<?> deleteMilestone(
            @PathVariable("projectId") Long projectId,
            @PathVariable("milestoneId") Long milestoneId
    ) {
        milestoneService.deleteMilestone(milestoneId);
        return ResponseEntity.ok(Map.of("message", "Milestone deleted successfully"));
    }
}
