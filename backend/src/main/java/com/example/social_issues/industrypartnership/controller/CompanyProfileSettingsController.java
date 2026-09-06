package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.TeamMemberStatus;
import com.example.social_issues.industrypartnership.service.CompanySettingsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/industry/profile")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class CompanyProfileSettingsController {

    private final CompanySettingsService companySettingsService;
    private final AuthService authService;

    public CompanyProfileSettingsController(CompanySettingsService companySettingsService, AuthService authService) {
        this.companySettingsService = companySettingsService;
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

    // -------------------------------------------------------------
    // 1. Company Profile Endpoints
    // -------------------------------------------------------------

    @GetMapping
    public ResponseEntity<?> getCompanyProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            CompanyProfileDto profile = companySettingsService.getCompanyProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateCompanyProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody UpdateCompanyProfileRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            CompanyProfileDto updated = companySettingsService.updateCompanyProfile(userId, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // -------------------------------------------------------------
    // 2. Team Members & Role Management Endpoints
    // -------------------------------------------------------------

    @GetMapping("/team")
    public ResponseEntity<?> getTeamMembers(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<IndustryTeamMemberDto> members = companySettingsService.getTeamMembers(userId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/team/invite")
    public ResponseEntity<?> inviteTeamMember(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody InviteTeamMemberRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            IndustryTeamMemberDto member = companySettingsService.inviteTeamMember(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(member);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/team/{id}/role")
    public ResponseEntity<?> updateTeamMemberRole(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTeamMemberRoleRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            IndustryTeamMemberDto updated = companySettingsService.updateTeamMemberRole(userId, id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/team/{id}/status")
    public ResponseEntity<?> updateTeamMemberStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestParam TeamMemberStatus status
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            IndustryTeamMemberDto updated = companySettingsService.updateTeamMemberStatus(userId, id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/team/{id}")
    public ResponseEntity<?> deleteTeamMember(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            companySettingsService.deleteTeamMember(userId, id);
            return ResponseEntity.ok(Map.of("message", "Team member removed successfully", "id", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/team/resend-invite/{id}")
    public ResponseEntity<?> resendInvitation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            IndustryTeamMemberDto member = companySettingsService.resendInvitation(userId, id);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/team/accept-invite")
    public ResponseEntity<?> acceptInvitation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody AcceptInvitationRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            IndustryTeamMemberDto member = companySettingsService.acceptInvitation(userId, request.getToken());
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // -------------------------------------------------------------
    // 3. Notification Preferences & Domain Subscriptions Endpoints
    // -------------------------------------------------------------

    @GetMapping("/preferences")
    public ResponseEntity<?> getNotificationPreferences(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            CorporateNotificationPreferencesDto prefs = companySettingsService.getNotificationPreferences(userId);
            return ResponseEntity.ok(prefs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updateNotificationPreferences(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody UpdateNotificationPreferencesRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            CorporateNotificationPreferencesDto updated = companySettingsService.updateNotificationPreferences(userId, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
