package com.example.social_issues.projectlifecycle.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.projectlifecycle.dto.CreateIpRecordRequest;
import com.example.social_issues.projectlifecycle.dto.IpRecordDto;
import com.example.social_issues.projectlifecycle.dto.UpdateIpStatusRequest;
import com.example.social_issues.projectlifecycle.model.IpStatus;
import com.example.social_issues.projectlifecycle.model.IpType;
import com.example.social_issues.projectlifecycle.service.IntellectualPropertyService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class IntellectualPropertyController {

    private static final Logger log = LoggerFactory.getLogger(IntellectualPropertyController.class);

    private final IntellectualPropertyService ipService;
    private final AuthService authService;

    public IntellectualPropertyController(IntellectualPropertyService ipService, AuthService authService) {
        this.ipService = ipService;
        this.authService = authService;
    }

    /**
     * 1. Get all IP records for a project
     * GET /api/projects/{projectId}/ip-records
     */
    @GetMapping("/projects/{projectId}/ip-records")
    public ResponseEntity<List<IpRecordDto>> getIpRecordsByProject(@PathVariable("projectId") Long projectId) {
        return ResponseEntity.ok(ipService.getIpRecordsByProject(projectId));
    }

    /**
     * 2. Register a new IP disclosure / patent application
     * POST /api/projects/{projectId}/ip-records
     */
    @PostMapping("/projects/{projectId}/ip-records")
    public ResponseEntity<IpRecordDto> createIpRecord(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody CreateIpRecordRequest request
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

        log.info("API: Creating IP Record '{}' for project ID: {}", request.getTitle(), projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ipService.createIpRecord(projectId, request, submitterId));
    }

    /**
     * 3. Get single IP record by ID
     * GET /api/projects/{projectId}/ip-records/{id}`
     */
    @GetMapping("/projects/{projectId}/ip-records/{id}")
    public ResponseEntity<IpRecordDto> getIpRecordById(
            @PathVariable("projectId") Long projectId,
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.ok(ipService.getIpRecordById(id));
    }

    /**
     * 4. Update IP status / patent application details
     * PATCH /api/projects/{projectId}/ip-records/{id}/status
     */
    @PatchMapping("/projects/{projectId}/ip-records/{id}/status")
    public ResponseEntity<IpRecordDto> updateIpStatus(
            @PathVariable("projectId") Long projectId,
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateIpStatusRequest request
    ) {
        log.info("API: Updating IP Record ID: {} -> status: {}", id, request.getStatus());
        return ResponseEntity.ok(ipService.updateIpStatus(id, request));
    }

    /**
     * 5. Delete an IP record
     * DELETE /api/projects/{projectId}/ip-records/{id}
     */
    @DeleteMapping("/projects/{projectId}/ip-records/{id}")
    public ResponseEntity<?> deleteIpRecord(
            @PathVariable("projectId") Long projectId,
            @PathVariable("id") Long id
    ) {
        ipService.deleteIpRecord(id);
        return ResponseEntity.ok(Map.of("message", "IP record deleted successfully"));
    }

    /**
     * 6. Platform-wide IP & Technology Transfer Catalog (Public / Industry & Government)
     * GET /api/ip/catalog?ipType=SHARED_PATENT&status=GRANTED
     */
    @GetMapping("/ip/catalog")
    public ResponseEntity<List<IpRecordDto>> getPlatformIpCatalog(
            @RequestParam(name = "ipType", required = false) IpType ipType,
            @RequestParam(name = "status", required = false) IpStatus status
    ) {
        log.info("API: Fetching platform IP catalog with ipType: {}, status: {}", ipType, status);
        return ResponseEntity.ok(ipService.getPlatformIpCatalog(ipType, status));
    }
}
