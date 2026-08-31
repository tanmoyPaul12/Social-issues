package com.example.social_issues.industrypartnership.controller;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.service.AuthService;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.service.CsrComplianceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/industry/dashboard/csr")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class CsrComplianceController {

    private final CsrComplianceService csrComplianceService;
    private final AuthService authService;

    public CsrComplianceController(CsrComplianceService csrComplianceService, AuthService authService) {
        this.csrComplianceService = csrComplianceService;
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

    @GetMapping("/summary")
    public ResponseEntity<?> getCsrSummary(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false, defaultValue = "2026-2027") String financialYear
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            CsrBudgetSummaryDto summary = csrComplianceService.getCsrSummary(userId, financialYear);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/budget")
    public ResponseEntity<?> setAnnualBudget(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody SetCsrBudgetRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            CsrBudgetSummaryDto summary = csrComplianceService.setAnnualBudget(userId, request);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ledger")
    public ResponseEntity<?> getLedgerEntries(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false, defaultValue = "2026-2027") String financialYear,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long pilotId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            Page<CsrLedgerEntryDto> entries = csrComplianceService.getLedgerEntries(
                    userId,
                    financialYear,
                    category,
                    pilotId,
                    search,
                    PageRequest.of(page, size, Sort.by("id").descending())
            );
            return ResponseEntity.ok(entries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/certificates")
    public ResponseEntity<?> getUtilizationCertificates(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String financialYear,
            @RequestParam(required = false) Boolean isVerified,
            @RequestParam(required = false) Long pilotId
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            List<CsrUtilizationCertificateDto> certs = csrComplianceService.getUtilizationCertificates(
                    userId, financialYear, isVerified, pilotId
            );
            return ResponseEntity.ok(certs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/certificates/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadUtilizationCertificate(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) Long pilotId,
            @RequestParam(required = false, defaultValue = "2026-2027") String financialYear,
            @RequestParam(required = false) String certificateNumber,
            @RequestParam(required = false, defaultValue = "GFR_12A") String formType,
            @RequestParam(required = false) String universityName,
            @RequestParam(required = false) String grantSanctionOrderRef,
            @RequestParam(required = false) BigDecimal certifiedDisbursedAmount,
            @RequestParam(required = false) BigDecimal certifiedUtilizedAmount,
            @RequestParam(required = false) BigDecimal unspentBalanceAmount,
            @RequestParam(required = false) String caAuditorName,
            @RequestParam(required = false) String caFirmName,
            @RequestParam(required = false) String caMembershipNumber,
            @RequestParam(required = false) String udinNumber,
            @RequestParam(required = false) String issueDate,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            LocalDate parsedIssueDate = issueDate != null ? LocalDate.parse(issueDate) : LocalDate.now();

            CsrUtilizationCertificateDto dto = csrComplianceService.uploadUtilizationCertificate(
                    userId,
                    pilotId,
                    financialYear,
                    certificateNumber,
                    formType,
                    universityName,
                    grantSanctionOrderRef,
                    certifiedDisbursedAmount,
                    certifiedUtilizedAmount,
                    unspentBalanceAmount,
                    caAuditorName,
                    caFirmName,
                    caMembershipNumber,
                    udinNumber,
                    parsedIssueDate,
                    file
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/certificates/{id}/verify")
    public ResponseEntity<?> verifyCertificate(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody VerifyCertificateRequest request
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            CsrUtilizationCertificateDto dto = csrComplianceService.verifyCertificate(userId, id, request);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports/csr2")
    public ResponseEntity<?> getMcaCsr2Report(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false, defaultValue = "2026-2027") String financialYear
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            McaCsr2ReportDto report = csrComplianceService.getMcaCsr2Report(userId, financialYear);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports/csr2/export/csv")
    public ResponseEntity<?> exportMcaCsr2Csv(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false, defaultValue = "2026-2027") String financialYear
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            byte[] csvData = csrComplianceService.generateMcaCsr2Csv(userId, financialYear);

            String filename = "MCA_CSR2_Report_" + financialYear.replace("-", "_") + ".csv";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports/csr2/export/pdf")
    public ResponseEntity<?> exportMcaCsr2Pdf(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false, defaultValue = "2026-2027") String financialYear
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            byte[] pdfData = csrComplianceService.generateMcaCsr2Pdf(userId, financialYear);

            String filename = "MCA_CSR2_Compliance_" + financialYear.replace("-", "_") + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/audit-trail")
    public ResponseEntity<?> getAuditTrail(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String financialYear,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UserSummaryDto user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        try {
            Long userId = Long.parseLong(user.getId());
            Page<CsrAuditTrailDto> trails = csrComplianceService.getAuditTrail(
                    userId, financialYear, PageRequest.of(page, size, Sort.by("id").descending())
            );
            return ResponseEntity.ok(trails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
