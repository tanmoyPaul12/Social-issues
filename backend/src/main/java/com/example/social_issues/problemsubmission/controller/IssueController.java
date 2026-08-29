package com.example.social_issues.problemsubmission.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.model.Role;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.problemsubmission.dto.*;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.problemsubmission.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/issues")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class IssueController {

    private final IssueService issueService;
    private final AuthService authService;

    public IssueController(IssueService issueService, AuthService authService) {
        this.issueService = issueService;
        this.authService = authService;
    }

    /**
     * Submit a new Grassroot Issue (Direct Submission)
     */
    @PostMapping
    public ResponseEntity<?> submitIssue(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody IssueSubmitRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to submit a grassroot issue"));
        }

        try {
            Long submitterId = Long.parseLong(user.getId());
            IssueResponse response = issueService.createIssue(submitterId, request, false);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Save an issue as a Draft
     */
    @PostMapping("/draft")
    public ResponseEntity<?> saveDraftIssue(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody IssueSubmitRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to save draft"));
        }

        try {
            Long submitterId = Long.parseLong(user.getId());
            IssueResponse response = issueService.createIssue(submitterId, request, true);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update an existing DRAFT issue
     */
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateDraftIssue(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestBody IssueUpdateRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to edit issue"));
        }

        try {
            Long submitterId = Long.parseLong(user.getId());
            IssueResponse response = issueService.updateIssue(submitterId, id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Promote DRAFT to SUBMITTED
     */
    @PatchMapping("/{id}/submit")
    public ResponseEntity<?> submitDraft(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long submitterId = Long.parseLong(user.getId());
            IssueResponse response = issueService.submitDraftIssue(submitterId, id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a DRAFT issue
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDraft(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long submitterId = Long.parseLong(user.getId());
            issueService.deleteIssue(submitterId, id);
            return ResponseEntity.ok(Map.of("message", "Draft issue deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get single issue details by ID (Public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getIssueById(@PathVariable("id") Long id) {
        try {
            IssueResponse response = issueService.getIssueById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get single issue details by Issue Number (Public)
     */
    @GetMapping("/number/{issueNumber}")
    public ResponseEntity<?> getIssueByNumber(@PathVariable("issueNumber") String issueNumber) {
        try {
            IssueResponse response = issueService.getIssueByNumber(issueNumber);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Public / Filterable issue registry listing
     */
    @GetMapping
    public ResponseEntity<IssuePageResponse> getIssues(
            @RequestParam(value = "status", required = false) IssueStatus status,
            @RequestParam(value = "sector", required = false) IssueSector sector,
            @RequestParam(value = "priority", required = false) IssuePriority priority,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "block", required = false) String block,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir
    ) {
        IssuePageResponse response = issueService.getIssues(
                status, sector, priority, district, block, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get authenticated citizen's submitted & draft issues
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyIssues(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        Long submitterId = Long.parseLong(user.getId());
        IssuePageResponse response = issueService.getMyIssues(submitterId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Upload multimedia / document evidence to an issue (Stored in MinIO)
     */
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAttachment(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to upload evidence"));
        }

        try {
            Long submitterId = Long.parseLong(user.getId());
            AttachmentResponse response = issueService.addAttachment(submitterId, id, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete an attachment from an issue
     */
    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @PathVariable("attachmentId") Long attachmentId
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long submitterId = Long.parseLong(user.getId());
            issueService.deleteAttachment(submitterId, id, attachmentId);
            return ResponseEntity.ok(Map.of("message", "Attachment removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update Issue Status / Review Notes (Government & Admin only)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long id,
            @Valid @RequestBody IssueStatusUpdateRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Role role = user.getRole();
        boolean isAuthorized = role == Role.GOVERNMENT || role == Role.PRI_OFFICIAL
                || role == Role.NODAL_ADMIN || role == Role.ADMIN || role == Role.PLATFORM_ADMIN;

        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only Government officials and Platform Administrators can review and update issue status"));
        }

        try {
            Long reviewerId = Long.parseLong(user.getId());
            IssueResponse response = issueService.updateIssueStatus(reviewerId, id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Public stats summary for dashboards and analytics
     */
    @GetMapping("/stats")
    public ResponseEntity<IssueStatsResponse> getStats() {
        IssueStatsResponse stats = issueService.getIssueStats();
        return ResponseEntity.ok(stats);
    }

    private UserSummaryDto getAuthenticatedUser(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        return authService.getCurrentUser(authHeader);
    }
}
