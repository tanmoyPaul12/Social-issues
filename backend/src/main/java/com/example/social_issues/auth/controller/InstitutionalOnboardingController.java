package com.example.social_issues.auth.controller;

import com.example.social_issues.auth.dto.AuthResponse;
import com.example.social_issues.auth.dto.InstitutionalOnboardingRequest;
import com.example.social_issues.auth.service.InstitutionalOnboardingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/onboarding")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class InstitutionalOnboardingController {

    private final InstitutionalOnboardingService onboardingService;

    public InstitutionalOnboardingController(InstitutionalOnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/university")
    public ResponseEntity<AuthResponse> onboardUniversity(@RequestBody InstitutionalOnboardingRequest request) {
        AuthResponse response = onboardingService.onboardUniversity(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/industry")
    public ResponseEntity<AuthResponse> onboardIndustry(@RequestBody InstitutionalOnboardingRequest request) {
        AuthResponse response = onboardingService.onboardIndustry(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/government")
    public ResponseEntity<AuthResponse> onboardGovernment(@RequestBody InstitutionalOnboardingRequest request) {
        AuthResponse response = onboardingService.onboardGovernment(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
