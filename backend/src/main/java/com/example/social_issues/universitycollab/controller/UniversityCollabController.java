package com.example.social_issues.universitycollab.controller;

import com.example.social_issues.industrypartnership.dto.DiscussionMessageDto;
import com.example.social_issues.industrypartnership.dto.PostDiscussionRequest;
import com.example.social_issues.industrypartnership.service.ActivePilotsService;
import com.example.social_issues.universitycollab.dto.*;
import com.example.social_issues.universitycollab.service.UniversityCollabService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/university")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UniversityCollabController {

    private static final Logger log = LoggerFactory.getLogger(UniversityCollabController.class);

    private final UniversityCollabService collabService;
    private final ActivePilotsService activePilotsService;

    public UniversityCollabController(UniversityCollabService collabService, ActivePilotsService activePilotsService) {
        this.collabService = collabService;
        this.activePilotsService = activePilotsService;
    }

    /**
     * 1. Get challenges routed/recommended to this university by the AI Matchmaking Engine.
     * GET /api/university/challenges/routed?aisheCode=U-0012
     */
    @GetMapping("/challenges/routed")
    public ResponseEntity<List<RoutedChallengeDto>> getRoutedChallenges(
            @RequestParam(name = "aisheCode", required = false, defaultValue = "U-0205") String aisheCode) {
        log.info("API: getRoutedChallenges for aisheCode: {}", aisheCode);
        return ResponseEntity.ok(collabService.getRoutedChallenges(aisheCode));
    }

    /**
     * 2. Browse all open grassroots challenges in Jharkhand to request/claim.
     * GET /api/university/challenges/open?sector=WATER&district=Bokaro
     */
    @GetMapping("/challenges/open")
    public ResponseEntity<List<RoutedChallengeDto>> getAllOpenChallenges(
            @RequestParam(name = "sector", required = false) String sector,
            @RequestParam(name = "district", required = false) String district) {
        log.info("API: getAllOpenChallenges with sector: {}, district: {}", sector, district);
        return ResponseEntity.ok(collabService.getAllOpenChallenges(sector, district));
    }

    /**
     * 3. Claim an open problem to solve it.
     * POST /api/university/challenges/claim
     */
    @PostMapping("/challenges/claim")
    public ResponseEntity<ChallengeClaimResponse> claimChallenge(
            @Valid @RequestBody ChallengeClaimRequest request) {
        log.info("API: claimChallenge for issue ID: {} by AISHE: {}", request.getIssueId(), request.getAisheCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(collabService.claimChallenge(request));
    }

    /**
     * 4. View claims submitted by this university.
     * GET /api/university/challenges/my-claims?aisheCode=U-0012
     */
    @GetMapping("/challenges/my-claims")
    public ResponseEntity<List<ChallengeClaimResponse>> getMyClaims(
            @RequestParam(name = "aisheCode", required = false, defaultValue = "U-0205") String aisheCode) {
        return ResponseEntity.ok(collabService.getMyClaims(aisheCode));
    }

    /**
     * 5. Create / Activate a new University R&D Project with faculty and student team.
     * POST /api/university/projects
     */
    @PostMapping("/projects")
    public ResponseEntity<UniversityProjectResponse> createProject(
            @Valid @RequestBody CreateUniversityProjectRequest request) {
        log.info("API: createProject title: {} by AISHE: {}", request.getTitle(), request.getAisheCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(collabService.createProject(request));
    }

    /**
     * 6. Get all active projects for this university.
     * GET /api/university/projects?aisheCode=U-0012
     */
    @GetMapping("/projects")
    public ResponseEntity<List<UniversityProjectResponse>> getUniversityProjects(
            @RequestParam(name = "aisheCode", required = false, defaultValue = "U-0205") String aisheCode) {
        return ResponseEntity.ok(collabService.getUniversityProjects(aisheCode));
    }

    /**
     * 7. Get single project details including full team roster.
     * GET /api/university/projects/{id}
     */
    @GetMapping("/projects/{id}")
    public ResponseEntity<UniversityProjectResponse> getProjectById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(collabService.getProjectById(id));
    }

    /**
     * 8. Update project stage & progress.
     * PATCH /api/university/projects/{id}/stage
     */
    @PatchMapping("/projects/{id}/stage")
    public ResponseEntity<UniversityProjectResponse> updateProjectStage(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateProjectStageRequest request) {
        return ResponseEntity.ok(collabService.updateProjectStage(id, request));
    }

    /**
     * 9. Add Faculty or Student member to project team.
     * POST /api/university/projects/{projectId}/team
     */
    @PostMapping("/projects/{projectId}/team")
    public ResponseEntity<TeamMemberDto> addTeamMember(
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody TeamMemberDto memberDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collabService.addTeamMember(projectId, memberDto));
    }

    /**
     * 10. Remove team member from project.
     * DELETE /api/university/projects/{projectId}/team/{memberId}
     */
    @DeleteMapping("/projects/{projectId}/team/{memberId}")
    public ResponseEntity<Void> removeTeamMember(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId) {
        collabService.removeTeamMember(projectId, memberId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 11. View industry collaboration & CSR funding offers for university projects.
     * GET /api/university/industry-offers?aisheCode=U-0012
     */
    @GetMapping("/industry-offers")
    public ResponseEntity<List<IndustryOfferDto>> getIndustryOffers(
            @RequestParam(name = "aisheCode", required = false, defaultValue = "U-0205") String aisheCode) {
        return ResponseEntity.ok(collabService.getIndustryOffers(aisheCode));
    }

    /**
     * 12. Submit Industry CSR Grant / Mentorship Pitch for a project.
     * POST /api/university/projects/{id}/csr-pitch
     */
    @PostMapping("/projects/{id}/csr-pitch")
    public ResponseEntity<UniversityProjectResponse> submitCsrPitch(
            @PathVariable("id") Long id,
            @Valid @RequestBody CsrPitchRequest request) {
        log.info("API: submitCsrPitch for project ID: {}", id);
        return ResponseEntity.ok(collabService.submitCsrPitch(id, request));
    }

    /**
     * 13. Citizen Field Verification & Resolution Signoff.
     * POST /api/university/projects/{id}/verify-citizen
     */
    @PostMapping("/projects/{id}/verify-citizen")
    public ResponseEntity<UniversityProjectResponse> recordCitizenVerification(
            @PathVariable("id") Long id,
            @Valid @RequestBody CitizenVerificationRequest request) {
        log.info("API: recordCitizenVerification for project ID: {} with rating: {}", id, request.getCitizenRating());
        return ResponseEntity.ok(collabService.recordCitizenVerification(id, request));
    }

    /**
     * 14. Generate NAAC / NIRF Accreditation & NEP 2020 Report Card.
     * GET /api/university/accreditation/metrics?aisheCode=U-0012
     */
    @GetMapping("/accreditation/metrics")
    public ResponseEntity<AccreditationReportDto> getAccreditationSummary(
            @RequestParam(name = "aisheCode", required = false, defaultValue = "U-0205") String aisheCode) {
        log.info("API: getAccreditationSummary for AISHE: {}", aisheCode);
        return ResponseEntity.ok(collabService.getAccreditationSummary(aisheCode));
    }

    /**
     * 15. Fetch discussion messages for university project thread.
     * GET /api/university/projects/{id}/discussions
     */
    @GetMapping("/projects/{id}/discussions")
    public ResponseEntity<List<DiscussionMessageDto>> getProjectDiscussions(@PathVariable("id") Long id) {
        return ResponseEntity.ok(activePilotsService.getDiscussions(1L, id));
    }

    /**
     * 16. Post message to university project discussion thread.
     * POST /api/university/projects/{id}/discussions
     */
    @PostMapping("/projects/{id}/discussions")
    public ResponseEntity<?> postProjectDiscussion(
            @PathVariable("id") Long id,
            @Valid @RequestBody PostDiscussionRequest request) {
        DiscussionMessageDto posted = activePilotsService.postDiscussion(1L, id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message posted to research project discussion",
                "discussion", posted
        ));
    }
}
