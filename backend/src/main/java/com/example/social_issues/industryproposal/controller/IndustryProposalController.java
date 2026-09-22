package com.example.social_issues.industryproposal.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industryproposal.dto.*;
import com.example.social_issues.industryproposal.model.ProposalDocType;
import com.example.social_issues.industryproposal.service.IndustryProposalService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class IndustryProposalController {

    private final IndustryProposalService industryProposalService;
    private final AuthService authService;

    public IndustryProposalController(IndustryProposalService industryProposalService, AuthService authService) {
        this.industryProposalService = industryProposalService;
        this.authService = authService;
    }

    // 1. College/University publishes issue to Industry
    @PostMapping(value = "/issues/{id}/publish-to-industry", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> publishIssueMultipart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long issueId,
            @RequestParam(value = "collegeCustomNotes", required = false) String collegeCustomNotes,
            @RequestParam(value = "guidelineDoc", required = false) MultipartFile guidelineDoc
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to publish issues"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            PublishIssueRequest request = new PublishIssueRequest();
            request.setCollegeCustomNotes(collegeCustomNotes);
            PublicationResponse response = industryProposalService.publishIssueToIndustry(issueId, userId, request, guidelineDoc);
            return ResponseEntity.ok(response);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // JSON fallback for publish without file
    @PostMapping(value = "/issues/{id}/publish-to-industry", consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> publishIssueJson(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long issueId,
            @RequestBody(required = false) PublishIssueRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required to publish issues"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            PublicationResponse response = industryProposalService.publishIssueToIndustry(issueId, userId, request, null);
            return ResponseEntity.ok(response);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Toggle publication status
    @PostMapping("/industry/proposals/publications/{id}/toggle")
    public ResponseEntity<?> togglePublication(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Long publicationId,
            @RequestParam("isPublished") boolean isPublished
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }
        try {
            Long userId = Long.parseLong(user.getId());
            PublicationResponse response = industryProposalService.togglePublicationStatus(publicationId, userId, isPublished);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Industry browses published issues feed
    @GetMapping("/industry/proposals/published-issues")
    public ResponseEntity<Page<PublicationResponse>> getPublishedIssues(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(industryProposalService.getPublishedIssues(pageable));
    }

    // 3. Get single publication details
    @GetMapping("/industry/proposals/published-issues/{publicationId}")
    public ResponseEntity<?> getPublicationDetails(@PathVariable("publicationId") Long publicationId) {
        try {
            return ResponseEntity.ok(industryProposalService.getPublicationDetails(publicationId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 4. Get publication by issue ID (for college dashboard checking status)
    @GetMapping("/industry/proposals/issues/{issueId}/publication")
    public ResponseEntity<?> getPublicationByIssueId(@PathVariable("issueId") Long issueId) {
        try {
            return ResponseEntity.ok(industryProposalService.getPublicationByIssueId(issueId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 5. Download generated Apache PDFBox Brief
    @GetMapping("/industry/proposals/published-issues/{publicationId}/brief.pdf")
    public ResponseEntity<?> downloadBriefPdf(@PathVariable("publicationId") Long publicationId) {
        try {
            byte[] pdfBytes = industryProposalService.getIssueBriefPdfBytes(publicationId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"issue-brief-" + publicationId + ".pdf\"")
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 6. Industry submits solution proposal
    @PostMapping("/industry/proposals/published-issues/{publicationId}/submit")
    public ResponseEntity<?> submitProposal(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("publicationId") Long publicationId,
            @Valid @RequestBody ProposalSubmitRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            ProposalResponse response = industryProposalService.submitProposal(publicationId, userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 7. Industry uploads optional proposal document
    @PostMapping(value = "/industry/proposals/{proposalId}/documents", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> uploadDocument(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("proposalId") Long proposalId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "docType", required = false, defaultValue = "PROPOSAL_MAIN") ProposalDocType docType
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            ProposalDocumentResponse response = industryProposalService.uploadProposalDocument(proposalId, userId, title, docType, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 8. List documents for a proposal
    @GetMapping("/industry/proposals/{proposalId}/documents")
    public ResponseEntity<?> listDocuments(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("proposalId") Long proposalId
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<ProposalDocumentResponse> docs = industryProposalService.getProposalDocuments(proposalId, userId);
            return ResponseEntity.ok(docs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 9. College/University reviews proposals for a publication
    @GetMapping("/university/proposals/{publicationId}")
    public ResponseEntity<?> getProposalsForPublication(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("publicationId") Long publicationId
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<ProposalResponse> proposals = industryProposalService.getProposalsForPublication(publicationId, userId);
            return ResponseEntity.ok(proposals);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 10. Industry partner views their submitted proposals
    @GetMapping("/industry/proposals/my-proposals")
    public ResponseEntity<?> getMyProposals(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            Pageable pageable = PageRequest.of(page, size);
            Page<ProposalResponse> proposals = industryProposalService.getProposalsByIndustryUser(userId, pageable);
            return ResponseEntity.ok(proposals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 11. View single proposal by ID
    @GetMapping("/industry/proposals/{proposalId}")
    public ResponseEntity<?> getProposalById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("proposalId") Long proposalId
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            return ResponseEntity.ok(industryProposalService.getProposalById(proposalId, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 12. College/University accepts a proposal (activates chat thread)
    @PostMapping("/university/proposals/{proposalId}/accept")
    public ResponseEntity<?> acceptProposal(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("proposalId") Long proposalId,
            @RequestBody(required = false) AcceptProposalRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            ProposalResponse response = industryProposalService.acceptProposal(proposalId, userId, request);
            return ResponseEntity.ok(response);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 13. College/University rejects a proposal
    @PostMapping("/university/proposals/{proposalId}/reject")
    public ResponseEntity<?> rejectProposal(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("proposalId") Long proposalId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            String notes = body != null ? body.get("reviewerNotes") : null;
            ProposalResponse response = industryProposalService.rejectProposal(proposalId, userId, notes);
            return ResponseEntity.ok(response);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 14. Get communication thread messages for an accepted proposal
    @GetMapping("/proposals/thread/{threadRefId}")
    public ResponseEntity<?> getThreadMessages(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("threadRefId") String threadRefId
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<ProposalMessageResponse> messages = industryProposalService.getProposalThreadMessages(threadRefId, userId);
            return ResponseEntity.ok(messages);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (IllegalStateException ie) {
            return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of("error", ie.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 15. Post message to communication thread
    @PostMapping("/proposals/thread/{threadRefId}/messages")
    public ResponseEntity<?> postThreadMessage(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("threadRefId") String threadRefId,
            @Valid @RequestBody ProposalMessageRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            ProposalMessageResponse response = industryProposalService.postMessageToThread(threadRefId, userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (IllegalStateException ie) {
            return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of("error", ie.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private UserSummaryDto getAuthenticatedUser(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        return authService.getCurrentUser(authHeader);
    }
}
