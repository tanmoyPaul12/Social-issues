package com.example.social_issues.projectlifecycle.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.projectlifecycle.dto.ApprovalSignoffDto;
import com.example.social_issues.projectlifecycle.dto.DualClosedLoopStatusDto;
import com.example.social_issues.projectlifecycle.dto.SubmitSignoffRequest;
import com.example.social_issues.projectlifecycle.service.StageApprovalService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects/{projectId}/signoffs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class StageApprovalController {

    private static final Logger log = LoggerFactory.getLogger(StageApprovalController.class);

    private final StageApprovalService stageApprovalService;
    private final AuthService authService;

    public StageApprovalController(StageApprovalService stageApprovalService, AuthService authService) {
        this.stageApprovalService = stageApprovalService;
        this.authService = authService;
    }

    /**
     * 1. Get all stage approval sign-offs for a project
     * GET /api/projects/{projectId}/signoffs
     */
    @GetMapping
    public ResponseEntity<List<ApprovalSignoffDto>> getSignoffsByProject(@PathVariable("projectId") Long projectId) {
        return ResponseEntity.ok(stageApprovalService.getSignoffsByProject(projectId));
    }

    /**
     * 2. Submit stage approval / digital signature
     * POST /api/projects/{projectId}/signoffs
     */
    @PostMapping
    public ResponseEntity<ApprovalSignoffDto> recordSignoff(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody SubmitSignoffRequest request
    ) {
        Long actorUserId = null;
        String actorName = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                UserSummaryDto user = authService.getCurrentUser(authHeader.substring(7));
                if (user != null) {
                    if (user.getId() != null) actorUserId = Long.parseLong(user.getId());
                    if (user.getName() != null) actorName = user.getName();
                }
            } catch (Exception ignored) {}
        }

        log.info("API: Recording stage sign-off for project ID: {} [Stage: {}, Role: {}]",
                projectId, request.getStage(), request.getApproverRole());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stageApprovalService.recordSignoff(projectId, request, actorUserId, actorName));
    }

    /**
     * 3. Check Dual Closed-Loop Sign-off Status (Citizen Rating + Nodal Officer Closure)
     * GET /api/projects/{projectId}/signoffs/closed-loop-status
     */
    @GetMapping("/closed-loop-status")
    public ResponseEntity<DualClosedLoopStatusDto> getDualClosedLoopStatus(@PathVariable("projectId") Long projectId) {
        return ResponseEntity.ok(stageApprovalService.getDualClosedLoopStatus(projectId));
    }

    /**
     * 4. Delete sign-off record
     * DELETE /api/projects/{projectId}/signoffs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSignoff(
            @PathVariable("projectId") Long projectId,
            @PathVariable("id") Long id
    ) {
        stageApprovalService.deleteSignoff(id);
        return ResponseEntity.ok(Map.of("message", "Sign-off record deleted successfully"));
    }
}
