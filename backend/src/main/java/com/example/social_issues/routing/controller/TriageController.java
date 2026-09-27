package com.example.social_issues.routing.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.model.Role;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.problemsubmission.dto.IssuePageResponse;
import com.example.social_issues.problemsubmission.dto.IssueResponse;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.repository.GrassrootIssueRepository;
import com.example.social_issues.routing.dto.TriageAssignRequest;
import com.example.social_issues.routing.dto.TriageRejectRequest;
import com.example.social_issues.routing.dto.TriageValidateRequest;
import com.example.social_issues.routing.service.RoutingService;
import com.example.social_issues.problemsubmission.service.AiServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import com.example.social_issues.routing.service.UniversityEmbeddingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/triage")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000",
        "http://127.0.0.1:3001" }, allowCredentials = "true")
public class TriageController {

    private static final Logger log = LoggerFactory.getLogger(TriageController.class);

    private final RoutingService routingService;
    private final AuthService authService;
    private final AiServiceClient aiServiceClient;
    private final GrassrootIssueRepository issueRepository;
    private final ObjectMapper objectMapper;
    private final UniversityEmbeddingService universityEmbeddingService;
    private final com.example.social_issues.auth.repository.UserRepository userRepository;

    public TriageController(
            RoutingService routingService,
            AuthService authService,
            AiServiceClient aiServiceClient,
            GrassrootIssueRepository issueRepository,
            ObjectMapper objectMapper,
            UniversityEmbeddingService universityEmbeddingService,
            com.example.social_issues.auth.repository.UserRepository userRepository) {
        this.routingService = routingService;
        this.authService = authService;
        this.aiServiceClient = aiServiceClient;
        this.issueRepository = issueRepository;
        this.objectMapper = objectMapper;
        this.universityEmbeddingService = universityEmbeddingService;
        this.userRepository = userRepository;
    }

    /**
     * Get paginated triage queue for Nodal and Government officers
     * GET /api/triage/queue or GET /api/triage/issues
     */
    @GetMapping(value = {"/queue", "/issues"})
    public ResponseEntity<?> getTriageQueue(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) IssueStatus status,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "sector", required = false) IssueSector sector,
            @RequestParam(value = "priority", required = false) IssuePriority priority,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size) {
        if (authHeader != null && !authHeader.isBlank()) {
            UserSummaryDto user = getAuthenticatedNodalUser(authHeader);
            if (user != null && !isAuthorizedNodalRole(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: Nodal Admin or Government role required"));
            }
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
     * GET /api/triage/queue/list or GET /api/triage/issues/list
     */
    @GetMapping(value = {"/queue/list", "/issues/list"})
    public ResponseEntity<?> getTriageQueueList(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) IssueStatus status,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "sector", required = false) IssueSector sector,
            @RequestParam(value = "priority", required = false) IssuePriority priority) {
        if (authHeader != null && !authHeader.isBlank()) {
            UserSummaryDto user = getAuthenticatedNodalUser(authHeader);
            if (user != null && !isAuthorizedNodalRole(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: Nodal Admin or Government role required"));
            }
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
            @RequestBody(required = false) TriageValidateRequest request) {
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
            IssueResponse response = routingService.validateAndConfirm(reviewerId, id,
                    request != null ? request : new TriageValidateRequest());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error validating issue #{}: ", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify & Assign civic grievance to target University / HEI (Auto-promotes to
     * Project Management)
     * POST /api/triage/{id}/assign
     * POST /api/triage/{id}/verify-and-promote
     */
    @PostMapping(value = { "/{id}/assign", "/{id}/verify-and-promote" })
    public ResponseEntity<?> assignIssueToHEI(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @Valid @RequestBody TriageAssignRequest request) {
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
     * Revoke and recall problem statement allocation from a university back to the
     * statewide pool
     * POST /api/triage/{id}/revoke
     */
    @PostMapping("/{id}/revoke")
    public ResponseEntity<?> revokeIssue(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestBody(required = false) com.example.social_issues.routing.dto.TriageRevokeRequest request) {
        UserSummaryDto user = getAuthenticatedNodalUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to revoke issue allocation"));
        }
        if (!isAuthorizedNodalRole(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Nodal Admin or Government role required"));
        }

        try {
            Long reviewerId = Long.parseLong(user.getId());
            IssueResponse response = routingService.revokeAllocation(reviewerId, id,
                    request != null ? request : new com.example.social_issues.routing.dto.TriageRevokeRequest());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error revoking issue allocation #{}: ", id, e);
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
            @RequestBody(required = false) TriageRejectRequest request) {
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
            IssueResponse response = routingService.rejectIssue(reviewerId, id,
                    request != null ? request : new TriageRejectRequest());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error rejecting issue #{}: ", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Executes Master Unified Multimodal Validation & University Routing via Spring
     * Backend
     * and automatically persists the analysis dossier and recommended HEIs to
     * PostgreSQL.
     * Backed by PostgreSQL table `university_embaddings`.
     * POST /api/triage/ai-verification
     */
    @PostMapping("/ai-verification")
    public ResponseEntity<?> runAiVerification(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> payload) {
        // Extract issue identifier to persist results
        Long targetId = null;
        String issueNum = null;

        if (payload.get("numeric_id") != null) {
            try {
                targetId = Long.parseLong(payload.get("numeric_id").toString());
            } catch (NumberFormatException ignored) {
            }
        }
        if (targetId == null && payload.get("id") != null) {
            try {
                targetId = Long.parseLong(payload.get("id").toString());
            } catch (NumberFormatException ignored) {
                issueNum = payload.get("id").toString();
            }
        }
        if (targetId == null && payload.get("issue_id") != null) {
            try {
                targetId = Long.parseLong(payload.get("issue_id").toString());
            } catch (NumberFormatException ignored) {
                if (issueNum == null)
                    issueNum = payload.get("issue_id").toString();
            }
        }
        if (issueNum == null && payload.get("issue_number") != null) {
            issueNum = payload.get("issue_number").toString();
        }

        GrassrootIssue issue = null;
        if (targetId != null) {
            issue = issueRepository.findById(targetId).orElse(null);
        }
        if (issue == null && issueNum != null) {
            issue = issueRepository.findByIssueNumber(issueNum).orElse(null);
        }

        Map<String, Object> aiResult = null;

        // Check if client already passed ai_result (e.g. from direct AI microservice)
        // to persist to DB
        if (payload.get("ai_result") instanceof Map<?, ?> existingResult) {
            @SuppressWarnings("unchecked")
            Map<String, Object> casted = (Map<String, Object>) existingResult;
            aiResult = casted;
        }

        // 1. Try Live AI Service client
        if (aiResult == null) {
            try {
                aiResult = aiServiceClient.analyzeUnifiedRouting(payload);
            } catch (Exception e) {
                log.info(
                        "AI microservice unavailable ({}), generating response directly from table university_embaddings...",
                        e.getMessage());
            }
        }

        // 2. If AI microservice was unreachable, generate directly from PostgreSQL
        // table university_embaddings
        if (aiResult == null && issue != null) {
            aiResult = universityEmbeddingService.generateAndSaveFromEmbeddingsTable(issue);
            return ResponseEntity.ok(aiResult);
        }

        if (aiResult == null) {
            String probTitle = payload.get("title") != null ? payload.get("title").toString()
                    : (payload.get("problem_text") != null ? payload.get("problem_text").toString()
                            : "Infrastructure Grievance");
            String probDesc = payload.get("description") != null ? payload.get("description").toString() : probTitle;
            String probDist = payload.get("district") != null ? payload.get("district").toString() : "Ranchi";
            String probSec = payload.get("sector") != null ? payload.get("sector").toString() : "INFRASTRUCTURE";
            aiResult = universityEmbeddingService.generateFromParams(probTitle, probDesc, probSec, probDist);
        }

        // 3. Persist AI results to GrassrootIssue in PostgreSQL
        try {
            if (issue == null && (payload.get("problem_text") != null || payload.get("title") != null || payload.get("description") != null)) {
                String probTitle = payload.get("title") != null ? payload.get("title").toString()
                        : (payload.get("problem_text") != null ? payload.get("problem_text").toString() : "Civic Grievance");
                String probDesc = payload.get("description") != null ? payload.get("description").toString() : probTitle;
                String probDist = payload.get("district") != null ? payload.get("district").toString() : "Ranchi";
                String probSec = payload.get("sector") != null ? payload.get("sector").toString() : "OTHER";

                com.example.social_issues.auth.model.User defaultSubmitter = userRepository.findAll().stream().findFirst().orElse(null);

                issue = new GrassrootIssue();
                int year = java.time.Year.now().getValue();
                int randDigits = 100000 + (int) (Math.random() * 900000);
                issue.setIssueNumber(String.format("GRI-%d-%06d", year, randDigits));
                issue.setTitle(probTitle.length() > 280 ? probTitle.substring(0, 280) : probTitle);
                issue.setDescription(probDesc);
                issue.setDistrict(probDist);
                issue.setStatus(IssueStatus.SUBMITTED);
                issue.setValidationStatus("PASS");
                if (defaultSubmitter != null) {
                    issue.setSubmitter(defaultSubmitter);
                }
                if (payload.get("latitude") instanceof Number lat) issue.setLatitude(lat.doubleValue());
                if (payload.get("longitude") instanceof Number lng) issue.setLongitude(lng.doubleValue());
                try {
                    issue.setSector(IssueSector.valueOf(probSec.toUpperCase()));
                } catch (Exception ignored) {
                    issue.setSector(IssueSector.OTHER);
                }
                issue = issueRepository.save(issue);
                log.info("Auto-created new GrassrootIssue #{} from AI verification upload.", issue.getIssueNumber());
            }

            if (issue != null) {
                String reportJson = objectMapper.writeValueAsString(aiResult);
                issue.setValidationReportJson(reportJson);
                issue.setValidationStatus("PASS");

                Object scoredUnis = aiResult.get("scored_universities");
                if (scoredUnis != null) {
                    issue.setRecommendedHeisJson(objectMapper.writeValueAsString(scoredUnis));
                }

                if (aiResult.get("validation") instanceof Map<?, ?> valMap) {
                    Object urgency = valMap.get("urgency_level");
                    if (urgency != null) {
                        try {
                            issue.setPriority(IssuePriority.valueOf(urgency.toString().toUpperCase()));
                        } catch (Exception ignored) {
                        }
                    }
                }

                // If assignedHEI is empty, assign top recommendation
                if ((issue.getAssignedHEI() == null || issue.getAssignedHEI().isBlank())
                        && scoredUnis instanceof List<?> list && !list.isEmpty()) {
                    Object firstUni = list.get(0);
                    if (firstUni instanceof Map<?, ?> uniMap && uniMap.get("university_name") != null) {
                        issue.setAssignedHEI(uniMap.get("university_name").toString());
                    }
                }

                issueRepository.save(issue);
                log.info("Persisted AI verification results to GrassrootIssue #{} (ID: {})", issue.getIssueNumber(),
                        issue.getId());
            }
        } catch (Exception e) {
            log.error("Error saving AI verification result to database: ", e);
        }

        return ResponseEntity.ok(aiResult);
    }

    /**
     * Get saved AI verification dossier for an issue from the database.
     * If not yet verified, loads from table university_embaddings and saves.
     * GET /api/triage/{id}/ai-verification
     */
    @GetMapping("/{id}/ai-verification")
    public ResponseEntity<?> getSavedAiVerification(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id) {
        try {
            Optional<GrassrootIssue> issueOpt = issueRepository.findById(id);
            if (issueOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Issue not found with ID: " + id));
            }
            GrassrootIssue issue = issueOpt.get();

            // If already verified in database, return saved dossier
            if (issue.getValidationReportJson() != null && !issue.getValidationReportJson().isBlank()) {
                Map<String, Object> data = objectMapper.readValue(
                        issue.getValidationReportJson(),
                        new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {
                        });
                return ResponseEntity.ok(data);
            }

            // Otherwise, load from university_embaddings table and save
            Map<String, Object> data = universityEmbeddingService.generateAndSaveFromEmbeddingsTable(issue);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Error retrieving AI verification record for issue #{}: ", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Query table university_embaddings directly from PostgreSQL database
     * GET /api/triage/university-embeddings
     */
    @GetMapping("/university-embeddings")
    public ResponseEntity<?> getUniversityEmbeddings(
            @RequestParam(value = "domain", required = false, defaultValue = "ALL") String domain,
            @RequestParam(value = "district", required = false, defaultValue = "Jharkhand") String district,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {
        try {
            List<Map<String, Object>> records = universityEmbeddingService.queryUniversityEmbeddings(domain, district,
                    limit);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            log.error("Error querying university_embaddings: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all registered onboarded universities from PostgreSQL database
     * GET /api/triage/universities
     */
    @GetMapping("/universities")
    public ResponseEntity<?> getRegisteredUniversities() {
        try {
            List<Map<String, Object>> universities = universityEmbeddingService.getRegisteredUniversities();
            return ResponseEntity.ok(universities);
        } catch (Exception e) {
            log.error("Error fetching registered universities: ", e);
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
        if (role == null)
            return false;
        return role == Role.STATE_SUPERADMIN ||
                role == Role.GOVERNMENT ||
                role == Role.PRI_OFFICIAL ||
                role == Role.NODAL_ADMIN ||
                role == Role.ADMIN ||
                role == Role.PLATFORM_ADMIN;
    }
}
