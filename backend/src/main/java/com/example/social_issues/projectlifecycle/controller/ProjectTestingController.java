package com.example.social_issues.projectlifecycle.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.projectlifecycle.dto.RecordTestResultRequest;
import com.example.social_issues.projectlifecycle.dto.TestResultDto;
import com.example.social_issues.projectlifecycle.service.ProjectTestingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects/{projectId}/tests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class ProjectTestingController {

    private static final Logger log = LoggerFactory.getLogger(ProjectTestingController.class);

    private final ProjectTestingService testingService;
    private final AuthService authService;

    public ProjectTestingController(ProjectTestingService testingService, AuthService authService) {
        this.testingService = testingService;
        this.authService = authService;
    }

    /**
     * 1. Get all testing records for a project
     * GET /api/projects/{projectId}/tests
     */
    @GetMapping
    public ResponseEntity<List<TestResultDto>> getTestResultsByProject(@PathVariable("projectId") Long projectId) {
        return ResponseEntity.ok(testingService.getTestResultsByProject(projectId));
    }

    /**
     * 2. Log a new lab or field test outcome
     * POST /api/projects/{projectId}/tests
     */
    @PostMapping
    public ResponseEntity<TestResultDto> recordTestResult(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody RecordTestResultRequest request
    ) {
        Long testerUserId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                UserSummaryDto user = authService.getCurrentUser(authHeader.substring(7));
                if (user != null && user.getId() != null) {
                    testerUserId = Long.parseLong(user.getId());
                }
            } catch (Exception ignored) {}
        }

        log.info("API: Recording Test Result '{}' (TRL {}) for project ID: {}", request.getTestTitle(), request.getTrlLevel(), projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(testingService.recordTestResult(projectId, request, testerUserId));
    }

    /**
     * 3. Get single test record by ID
     * GET /api/projects/{projectId}/tests/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TestResultDto> getTestResultById(
            @PathVariable("projectId") Long projectId,
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.ok(testingService.getTestResultById(id));
    }

    /**
     * 4. Get highest verified TRL rating for a project
     * GET /api/projects/{projectId}/tests/highest-trl
     */
    @GetMapping("/highest-trl")
    public ResponseEntity<Map<String, Object>> getHighestTrl(@PathVariable("projectId") Long projectId) {
        Integer trl = testingService.getProjectHighestTrl(projectId);
        return ResponseEntity.ok(Map.of("projectId", projectId, "highestVerifiedTrl", trl));
    }

    /**
     * 5. Delete test record
     * DELETE /api/projects/{projectId}/tests/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestResult(
            @PathVariable("projectId") Long projectId,
            @PathVariable("id") Long id
    ) {
        testingService.deleteTestResult(id);
        return ResponseEntity.ok(Map.of("message", "Test record deleted successfully"));
    }
}
