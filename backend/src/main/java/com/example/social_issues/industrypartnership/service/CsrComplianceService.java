package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.industrypartnership.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface CsrComplianceService {

    CsrBudgetSummaryDto getCsrSummary(Long userId, String financialYear);

    CsrBudgetSummaryDto setAnnualBudget(Long userId, SetCsrBudgetRequest request);

    Page<CsrLedgerEntryDto> getLedgerEntries(
            Long userId,
            String financialYear,
            String category,
            Long pilotId,
            String search,
            Pageable pageable
    );

    List<CsrUtilizationCertificateDto> getUtilizationCertificates(
            Long userId,
            String financialYear,
            Boolean isVerified,
            Long pilotId
    );

    CsrUtilizationCertificateDto uploadUtilizationCertificate(
            Long userId,
            Long pilotId,
            String financialYear,
            String certificateNumber,
            String formType,
            String universityName,
            String grantSanctionOrderRef,
            BigDecimal certifiedDisbursedAmount,
            BigDecimal certifiedUtilizedAmount,
            BigDecimal unspentBalanceAmount,
            String caAuditorName,
            String caFirmName,
            String caMembershipNumber,
            String udinNumber,
            LocalDate issueDate,
            MultipartFile file
    );

    CsrUtilizationCertificateDto verifyCertificate(Long userId, Long certificateId, VerifyCertificateRequest request);

    McaCsr2ReportDto getMcaCsr2Report(Long userId, String financialYear);

    byte[] generateMcaCsr2Csv(Long userId, String financialYear);

    byte[] generateMcaCsr2Pdf(Long userId, String financialYear);

    Page<CsrAuditTrailDto> getAuditTrail(Long userId, String financialYear, Pageable pageable);

    void recordAudit(
            IndustryProfile profile,
            String financialYear,
            String actionType,
            String actionTitle,
            String detailsJson,
            Long actorUserId,
            String actorName,
            String actorRole,
            String entityType,
            Long entityId
    );
}
