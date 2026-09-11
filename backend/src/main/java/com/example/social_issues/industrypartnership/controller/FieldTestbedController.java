package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.service.FieldTestbedService;
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
@RequestMapping("/industry/dashboard/testbeds")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class FieldTestbedController {

    private final FieldTestbedService fieldTestbedService;
    private final AuthService authService;

    public FieldTestbedController(FieldTestbedService fieldTestbedService, AuthService authService) {
        this.fieldTestbedService = fieldTestbedService;
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

    /**
     * 1. Get paginated and filtered list of field testbeds
     */
    @GetMapping
    public ResponseEntity<?> getTestbeds(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to access field testbeds"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            Page<TestbedSponsorshipDto> result = fieldTestbedService.getTestbeds(
                    userId, district, status, search, page, size
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 2. Get district aggregation summary of active deployments
     */
    @GetMapping("/district-summary")
    public ResponseEntity<?> getDistrictSummary(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<TestbedDistrictSummaryDto> summary = fieldTestbedService.getDistrictSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 3. Get single field testbed details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTestbedById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            TestbedSponsorshipDto testbed = fieldTestbedService.getTestbedById(userId, id);
            return ResponseEntity.ok(testbed);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 4. Create new field testbed sponsorship
     */
    @PostMapping
    public ResponseEntity<?> createTestbed(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CreateTestbedRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            TestbedSponsorshipDto created = fieldTestbedService.createTestbed(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 5. Update field testbed deployment status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTestbedStatusRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            TestbedSponsorshipDto updated = fieldTestbedService.updateStatus(userId, id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 6. Upload field verification evidence photos
     */
    @PostMapping(value = "/{id}/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadEvidence(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            TestbedSponsorshipDto updated = fieldTestbedService.uploadEvidence(userId, id, files);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 7. Delete field testbed deployment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestbed(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            fieldTestbedService.deleteTestbed(userId, id);
            return ResponseEntity.ok(Map.of("message", "Testbed deployment deleted successfully", "id", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
