package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.PilotDocumentType;
import com.example.social_issues.industrypartnership.service.ActivePilotsService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/industry/dashboard/pilots")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class ActivePilotsController {

    private final ActivePilotsService activePilotsService;
    private final AuthService authService;

    public ActivePilotsController(ActivePilotsService activePilotsService, AuthService authService) {
        this.activePilotsService = activePilotsService;
        this.authService = authService;
    }

    /**
     * 1. Get paginated and filtered list of active co-funded pilots
     */
    @GetMapping
    public ResponseEntity<?> getActivePilots(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "healthStatus", required = false) String healthStatus,
            @RequestParam(value = "stage", required = false) String stage,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sortBy", defaultValue = "NEWEST") String sortBy,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access active pilots"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            Page<ActivePilotSummaryDto> result = activePilotsService.getActivePilots(
                    userId, status, healthStatus, stage, search, sortBy, page, size
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 2. Get aggregate overview metrics (total active, budget committed vs disbursed, at risk count)
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getOverviewMetrics(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access pilot overview metrics"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            ActivePilotsOverviewDto overview = activePilotsService.getOverviewMetrics(userId);
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 3. Get complete project dossier (milestone tracker, disbursement ledger, discussions, docs)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPilotDetail(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            ActivePilotDetailDto detail = activePilotsService.getPilotDetail(userId, id);
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 4. Update health status of a pilot (e.g. ON_TRACK -> AT_RISK or DELAYED)
     */
    @PatchMapping("/{id}/health")
    public ResponseEntity<?> updateHealthStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdatePilotHealthRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            ActivePilotSummaryDto updated = activePilotsService.updateHealthStatus(userId, id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Pilot health status updated successfully",
                    "pilot", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 5. Review & approve or request revision on a submitted milestone
     */
    @PostMapping("/{id}/milestones/{milestoneId}/review")
    public ResponseEntity<?> reviewMilestone(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @PathVariable("milestoneId") Long milestoneId,
            @Valid @RequestBody ReviewMilestoneRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            MilestoneDto updated = activePilotsService.reviewMilestone(userId, id, milestoneId, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Milestone review submitted successfully",
                    "milestone", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 6. Record / execute a grant tranche disbursement release
     */
    @PostMapping("/{id}/disbursements/release")
    public ResponseEntity<?> releaseDisbursement(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @Valid @RequestBody ReleaseDisbursementRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            DisbursementDto updated = activePilotsService.releaseDisbursement(userId, id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Grant tranche disbursement recorded and released",
                    "disbursement", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 7. Fetch discussion thread messages for a pilot
     */
    @GetMapping("/{id}/discussions")
    public ResponseEntity<?> getDiscussions(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<DiscussionMessageDto> discussions = activePilotsService.getDiscussions(userId, id);
            return ResponseEntity.ok(discussions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 8. Post a message to the academic team discussion thread
     */
    @PostMapping("/{id}/discussions")
    public ResponseEntity<?> postDiscussion(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @Valid @RequestBody PostDiscussionRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            DiscussionMessageDto posted = activePilotsService.postDiscussion(userId, id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message posted to research team thread",
                    "discussion", posted
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 9. List project documents
     */
    @GetMapping("/{id}/documents")
    public ResponseEntity<?> getDocuments(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestParam(value = "docType", required = false) PilotDocumentType docType
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<PilotDocumentDto> docs = activePilotsService.getDocuments(userId, id, docType);
            return ResponseEntity.ok(docs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 10. Upload a project document or evidence report
     */
    @PostMapping(value = "/{id}/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "docType", required = false) PilotDocumentType docType,
            @RequestParam("file") MultipartFile file
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            PilotDocumentDto doc = activePilotsService.uploadDocument(userId, id, title, docType, file);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Document uploaded to project repository",
                    "document", doc
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 11. Delete an uploaded document
     */
    @DeleteMapping("/{id}/documents/{docId}")
    public ResponseEntity<?> deleteDocument(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @PathVariable("docId") Long docId
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            activePilotsService.deleteDocument(userId, id, docId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Document removed from repository"
            ));
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
