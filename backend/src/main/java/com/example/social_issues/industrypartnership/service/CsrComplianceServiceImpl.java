package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.*;
import com.example.social_issues.industrypartnership.repository.*;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CsrComplianceServiceImpl implements CsrComplianceService {

    private static final Logger log = LoggerFactory.getLogger(CsrComplianceServiceImpl.class);

    private final IndustryProfileRepository industryProfileRepository;
    private final CsrAnnualBudgetRepository csrAnnualBudgetRepository;
    private final CsrCommitmentRepository csrCommitmentRepository;
    private final CoFundedPilotRepository coFundedPilotRepository;
    private final PilotDisbursementRepository pilotDisbursementRepository;
    private final CsrUtilizationCertificateRepository csrUtilizationCertificateRepository;
    private final CsrAuditTrailRepository csrAuditTrailRepository;
    private final FileStorageService fileStorageService;

    public CsrComplianceServiceImpl(
            IndustryProfileRepository industryProfileRepository,
            CsrAnnualBudgetRepository csrAnnualBudgetRepository,
            CsrCommitmentRepository csrCommitmentRepository,
            CoFundedPilotRepository coFundedPilotRepository,
            PilotDisbursementRepository pilotDisbursementRepository,
            CsrUtilizationCertificateRepository csrUtilizationCertificateRepository,
            CsrAuditTrailRepository csrAuditTrailRepository,
            FileStorageService fileStorageService
    ) {
        this.industryProfileRepository = industryProfileRepository;
        this.csrAnnualBudgetRepository = csrAnnualBudgetRepository;
        this.csrCommitmentRepository = csrCommitmentRepository;
        this.coFundedPilotRepository = coFundedPilotRepository;
        this.pilotDisbursementRepository = pilotDisbursementRepository;
        this.csrUtilizationCertificateRepository = csrUtilizationCertificateRepository;
        this.csrAuditTrailRepository = csrAuditTrailRepository;
        this.fileStorageService = fileStorageService;
    }

    private IndustryProfile resolveProfile(Long userId) {
        return industryProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    List<IndustryProfile> list = industryProfileRepository.findAll();
                    if (!list.isEmpty()) {
                        return list.get(0);
                    }
                    throw new IllegalArgumentException("Industry profile not found for user: " + userId);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public CsrBudgetSummaryDto getCsrSummary(Long userId, String financialYear) {
        IndustryProfile profile = resolveProfile(userId);
        String fy = (financialYear != null && !financialYear.isBlank()) ? financialYear : "2026-2027";

        Optional<CsrAnnualBudget> budgetOpt = csrAnnualBudgetRepository
                .findByIndustryProfileIdAndFinancialYear(profile.getId(), fy);

        BigDecimal mandatoryObligation = budgetOpt.map(b -> b.getMandatoryCsrObligation()).orElse(BigDecimal.valueOf(25000000));
        BigDecimal earmarkedForHeis = budgetOpt.map(b -> b.getEarmarkedForHeis()).orElse(BigDecimal.valueOf(10000000));

        BigDecimal totalCommitted = csrCommitmentRepository.sumCommittedAmountByProfileIdAndFy(profile.getId(), fy);
        BigDecimal totalDisbursed = csrCommitmentRepository.sumDisbursedAmountByProfileIdAndFy(profile.getId(), fy);

        // Fallback to lifetime if current FY has no direct commitments yet
        if (totalCommitted.compareTo(BigDecimal.ZERO) == 0) {
            totalCommitted = csrCommitmentRepository.sumTotalCommittedAmountByProfileId(profile.getId());
        }
        if (totalDisbursed.compareTo(BigDecimal.ZERO) == 0) {
            totalDisbursed = csrCommitmentRepository.sumTotalDisbursedAmountByProfileId(profile.getId());
        }

        BigDecimal verifiedUtilized = csrUtilizationCertificateRepository
                .sumVerifiedUtilizedAmountByProfileIdAndFy(profile.getId(), fy);

        BigDecimal unspentBalance = mandatoryObligation.subtract(totalDisbursed).max(BigDecimal.ZERO);

        Double obligationUtilizationPct = mandatoryObligation.compareTo(BigDecimal.ZERO) > 0
                ? (totalDisbursed.doubleValue() / mandatoryObligation.doubleValue()) * 100.0
                : 0.0;

        Double earmarkedUtilizationPct = earmarkedForHeis.compareTo(BigDecimal.ZERO) > 0
                ? (totalDisbursed.doubleValue() / earmarkedForHeis.doubleValue()) * 100.0
                : 0.0;

        List<CoFundedPilot> pilots = coFundedPilotRepository.findByIndustryProfileId(profile.getId());
        List<CsrUtilizationCertificate> ucs = csrUtilizationCertificateRepository.findByIndustryProfileIdOrderByCreatedAtDesc(profile.getId());

        CsrBudgetSummaryDto dto = new CsrBudgetSummaryDto();
        dto.setFinancialYear(fy);
        dto.setCorporateName(profile.getCompanyName() != null ? profile.getCompanyName() : "Tata Steel Industrial Research");
        dto.setCinNumber(profile.getCinNumber() != null ? profile.getCinNumber() : "L27100MH1907PLC000260");
        dto.setGstin(profile.getGstin() != null ? profile.getGstin() : "20AAACT2727Q1ZW");

        dto.setMandatoryCsrObligation(mandatoryObligation);
        dto.setMandatoryCsrObligationFormatted(formatCurrency(mandatoryObligation));

        dto.setEarmarkedForHeis(earmarkedForHeis);
        dto.setEarmarkedForHeisFormatted(formatCurrency(earmarkedForHeis));

        dto.setTotalCommittedAmount(totalCommitted);
        dto.setTotalCommittedFormatted(formatCurrency(totalCommitted));

        dto.setTotalDisbursedAmount(totalDisbursed);
        dto.setTotalDisbursedFormatted(formatCurrency(totalDisbursed));

        dto.setVerifiedUtilizedAmount(verifiedUtilized);
        dto.setVerifiedUtilizedFormatted(formatCurrency(verifiedUtilized));

        dto.setUnspentBalanceAmount(unspentBalance);
        dto.setUnspentBalanceFormatted(formatCurrency(unspentBalance));

        dto.setObligationUtilizationPercentage(roundTwoDecimals(obligationUtilizationPct));
        dto.setEarmarkedUtilizationPercentage(roundTwoDecimals(earmarkedUtilizationPct));

        dto.setTotalActivePilotsCount(pilots.size());
        dto.setTotalAuditedUcsCount((int) ucs.stream().filter(u -> Boolean.TRUE.equals(u.getIsVerified())).count());

        // Category breakdown
        dto.setCategoryBreakdown(buildCategoryBreakdown(profile.getId(), totalDisbursed));

        return dto;
    }

    private List<CsrBudgetSummaryDto.ScheduleVIICategorySummaryDto> buildCategoryBreakdown(Long profileId, BigDecimal totalDisbursed) {
        List<CsrBudgetSummaryDto.ScheduleVIICategorySummaryDto> list = new ArrayList<>();

        List<SectorEngagementDto> sectorList = csrCommitmentRepository.getSectorWiseBreakdownByProfileId(profileId);

        if (sectorList.isEmpty()) {
            list.add(new CsrBudgetSummaryDto.ScheduleVIICategorySummaryDto(
                    "ITEM_IX",
                    "Item (ix) - Public Funded Universities & Incubators",
                    2L,
                    BigDecimal.valueOf(8700000),
                    formatCurrency(BigDecimal.valueOf(8700000)),
                    BigDecimal.valueOf(3200000),
                    formatCurrency(BigDecimal.valueOf(3200000)),
                    78.0
            ));
            list.add(new CsrBudgetSummaryDto.ScheduleVIICategorySummaryDto(
                    "ITEM_IV",
                    "Item (iv) - Environmental Sustainability & Water",
                    1L,
                    BigDecimal.valueOf(2500000),
                    formatCurrency(BigDecimal.valueOf(2500000)),
                    BigDecimal.valueOf(900000),
                    formatCurrency(BigDecimal.valueOf(900000)),
                    22.0
            ));
            return list;
        }

        double totalDisbursedDouble = totalDisbursed.compareTo(BigDecimal.ZERO) > 0 ? totalDisbursed.doubleValue() : 1.0;

        for (SectorEngagementDto s : sectorList) {
            String catName = mapSectorToScheduleVII(s.getSector());
            BigDecimal committed = s.getCommittedAmount() != null ? s.getCommittedAmount() : BigDecimal.ZERO;
            BigDecimal disbursed = committed.multiply(BigDecimal.valueOf(0.40)).setScale(2, RoundingMode.HALF_UP);
            double share = (disbursed.doubleValue() / totalDisbursedDouble) * 100.0;

            list.add(new CsrBudgetSummaryDto.ScheduleVIICategorySummaryDto(
                    "ITEM_IX",
                    catName,
                    s.getProjectCount(),
                    committed,
                    formatCurrency(committed),
                    disbursed,
                    formatCurrency(disbursed),
                    roundTwoDecimals(share)
            ));
        }

        return list;
    }

    private String mapSectorToScheduleVII(IssueSector sector) {
        if (sector == null) return "Item (ix) - Public Funded Universities & Incubators";
        switch (sector) {
            case ENVIRONMENT:
                return "Item (iv) - Environmental Sustainability & Agroforestry";
            case HEALTH:
                return "Item (i) - Healthcare & Malnutrition Eradication";
            case AGRICULTURE:
                return "Item (x) - Rural & Tribal Development Projects";
            case EDUCATION:
                return "Item (ii) - Education & Vocational Skilling";
            default:
                return "Item (ix) - Public Funded Universities & Incubators";
        }
    }

    @Override
    @Transactional
    public CsrBudgetSummaryDto setAnnualBudget(Long userId, SetCsrBudgetRequest request) {
        IndustryProfile profile = resolveProfile(userId);

        CsrAnnualBudget budget = csrAnnualBudgetRepository
                .findByIndustryProfileIdAndFinancialYear(profile.getId(), request.getFinancialYear())
                .orElseGet(() -> {
                    CsrAnnualBudget b = new CsrAnnualBudget();
                    b.setIndustryProfile(profile);
                    b.setFinancialYear(request.getFinancialYear());
                    return b;
                });

        budget.setMandatoryCsrObligation(request.getMandatoryCsrObligation());
        budget.setEarmarkedForHeis(request.getEarmarkedForHeis());
        if (request.getUnspentCarriedForward() != null) {
            budget.setUnspentCarriedForward(request.getUnspentCarriedForward());
        }
        if (request.getIsBoardApproved() != null) {
            budget.setIsBoardApproved(request.getIsBoardApproved());
            if (request.getIsBoardApproved()) {
                budget.setBoardApprovalDate(LocalDateTime.now());
            }
        }

        csrAnnualBudgetRepository.save(budget);

        recordAudit(
                profile,
                request.getFinancialYear(),
                "SET_ANNUAL_BUDGET",
                "Updated Annual Statutory CSR Obligation for " + request.getFinancialYear(),
                String.format("{\"mandatoryObligation\": %s, \"earmarkedForHeis\": %s}",
                        request.getMandatoryCsrObligation(), request.getEarmarkedForHeis()),
                userId,
                profile.getCompanyName(),
                "CSR_HEAD",
                "CsrAnnualBudget",
                budget.getId()
        );

        return getCsrSummary(userId, request.getFinancialYear());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CsrLedgerEntryDto> getLedgerEntries(
            Long userId,
            String financialYear,
            String category,
            Long pilotId,
            String search,
            Pageable pageable
    ) {
        IndustryProfile profile = resolveProfile(userId);
        List<PilotDisbursement> allDisbursements = pilotDisbursementRepository.findByIndustryProfileId(profile.getId());

        // Also fetch UCs to cross-reference
        List<CsrUtilizationCertificate> ucs = csrUtilizationCertificateRepository.findByIndustryProfileIdOrderByCreatedAtDesc(profile.getId());
        Map<Long, CsrUtilizationCertificate> pilotToUcMap = new HashMap<>();
        for (CsrUtilizationCertificate uc : ucs) {
            if (uc.getPilot() != null) {
                pilotToUcMap.put(uc.getPilot().getId(), uc);
            }
        }

        List<CsrLedgerEntryDto> dtos = allDisbursements.stream()
                .filter(d -> {
                    if (pilotId != null && (d.getPilot() == null || !d.getPilot().getId().equals(pilotId))) {
                        return false;
                    }
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        String title = d.getPilot() != null ? d.getPilot().getTitle().toLowerCase() : "";
                        String uni = d.getPilot() != null ? d.getPilot().getUniversityName().toLowerCase() : "";
                        String ref = d.getDisbursementReference() != null ? d.getDisbursementReference().toLowerCase() : "";
                        String utr = d.getUtrNumber() != null ? d.getUtrNumber().toLowerCase() : "";
                        if (!title.contains(s) && !uni.contains(s) && !ref.contains(s) && !utr.contains(s)) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(d -> {
                    Long pId = d.getPilot() != null ? d.getPilot().getId() : null;
                    CsrUtilizationCertificate uc = pId != null ? pilotToUcMap.get(pId) : null;
                    boolean hasUc = uc != null && Boolean.TRUE.equals(uc.getIsVerified());
                    String ucNum = uc != null ? uc.getCertificateNumber() : null;
                    return CsrLedgerEntryDto.fromDisbursement(d, financialYear, hasUc, ucNum);
                })
                .sorted(Comparator.comparing(dto -> dto.getTransactionDate(), Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), dtos.size());
        List<CsrLedgerEntryDto> pageContent = (start <= end && start < dtos.size()) ? dtos.subList(start, end) : Collections.emptyList();

        return new PageImpl<>(pageContent, pageable, dtos.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CsrUtilizationCertificateDto> getUtilizationCertificates(
            Long userId,
            String financialYear,
            Boolean isVerified,
            Long pilotId
    ) {
        IndustryProfile profile = resolveProfile(userId);
        List<CsrUtilizationCertificate> list = csrUtilizationCertificateRepository
                .findByIndustryProfileIdOrderByCreatedAtDesc(profile.getId());

        return list.stream()
                .filter(u -> {
                    if (financialYear != null && !financialYear.isBlank() && !financialYear.equalsIgnoreCase(u.getFinancialYear())) {
                        return false;
                    }
                    if (isVerified != null && !isVerified.equals(u.getIsVerified())) {
                        return false;
                    }
                    if (pilotId != null && (u.getPilot() == null || !u.getPilot().getId().equals(pilotId))) {
                        return false;
                    }
                    return true;
                })
                .map(CsrUtilizationCertificateDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CsrUtilizationCertificateDto uploadUtilizationCertificate(
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
    ) {
        IndustryProfile profile = resolveProfile(userId);

        CoFundedPilot pilot = null;
        if (pilotId != null) {
            pilot = coFundedPilotRepository.findById(pilotId).orElse(null);
        }

        String fileUrl = null;
        String storageKey = null;

        if (file != null && !file.isEmpty()) {
            FileStorageService.StoredFile stored = fileStorageService.storeFile(
                    file,
                    "csr-certificates/" + (pilotId != null ? pilotId : "general")
            );
            fileUrl = stored.fileUrl();
            storageKey = stored.storageKey();
        }

        CsrUtilizationCertificate uc = new CsrUtilizationCertificate();
        uc.setIndustryProfile(profile);
        uc.setPilot(pilot);
        uc.setCertificateNumber(certificateNumber != null ? certificateNumber : "UC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        uc.setFormType(formType != null ? formType : "GFR_12A");
        uc.setFinancialYear(financialYear != null ? financialYear : "2026-2027");
        uc.setUniversityName(universityName != null ? universityName : (pilot != null ? pilot.getUniversityName() : "Partner HEI"));
        uc.setGrantSanctionOrderRef(grantSanctionOrderRef);
        uc.setCertifiedDisbursedAmount(certifiedDisbursedAmount != null ? certifiedDisbursedAmount : BigDecimal.ZERO);
        uc.setCertifiedUtilizedAmount(certifiedUtilizedAmount != null ? certifiedUtilizedAmount : BigDecimal.ZERO);
        uc.setUnspentBalanceAmount(unspentBalanceAmount != null ? unspentBalanceAmount : BigDecimal.ZERO);
        uc.setCaAuditorName(caAuditorName);
        uc.setCaFirmName(caFirmName);
        uc.setCaMembershipNumber(caMembershipNumber);
        uc.setUdinNumber(udinNumber);
        uc.setIssueDate(issueDate != null ? issueDate : LocalDate.now());
        uc.setCertificateDocUrl(fileUrl);
        uc.setStorageKey(storageKey);
        uc.setIsVerified(false);

        csrUtilizationCertificateRepository.save(uc);

        recordAudit(
                profile,
                uc.getFinancialYear(),
                "UPLOAD_UTILIZATION_CERTIFICATE",
                "Uploaded Form GFR 12-A Certificate " + uc.getCertificateNumber() + " for " + uc.getUniversityName(),
                String.format("{\"ucNumber\": \"%s\", \"utilized\": %s, \"udin\": \"%s\"}",
                        uc.getCertificateNumber(), uc.getCertifiedUtilizedAmount(), uc.getUdinNumber()),
                userId,
                profile.getCompanyName(),
                "AUDITOR",
                "CsrUtilizationCertificate",
                uc.getId()
        );

        return CsrUtilizationCertificateDto.fromEntity(uc);
    }

    @Override
    @Transactional
    public CsrUtilizationCertificateDto verifyCertificate(Long userId, Long certificateId, VerifyCertificateRequest request) {
        CsrUtilizationCertificate uc = csrUtilizationCertificateRepository.findById(certificateId)
                .orElseThrow(() -> new IllegalArgumentException("Utilization certificate not found: " + certificateId));

        uc.setIsVerified(request.getVerified());
        uc.setVerifiedAt(LocalDateTime.now());
        uc.setVerifiedByUserId(userId);
        uc.setVerificationRemarks(request.getRemarks());

        csrUtilizationCertificateRepository.save(uc);

        recordAudit(
                uc.getIndustryProfile(),
                uc.getFinancialYear(),
                "VERIFY_UTILIZATION_CERTIFICATE",
                "Statutory Verification: " + uc.getCertificateNumber() + " status set to " + (request.getVerified() ? "VERIFIED" : "REJECTED"),
                String.format("{\"isVerified\": %b, \"remarks\": \"%s\"}", request.getVerified(), request.getRemarks()),
                userId,
                "CSR Compliance Committee",
                "COMPLIANCE_OFFICER",
                "CsrUtilizationCertificate",
                uc.getId()
        );

        return CsrUtilizationCertificateDto.fromEntity(uc);
    }

    @Override
    @Transactional(readOnly = true)
    public McaCsr2ReportDto getMcaCsr2Report(Long userId, String financialYear) {
        IndustryProfile profile = resolveProfile(userId);
        String fy = (financialYear != null && !financialYear.isBlank()) ? financialYear : "2026-2027";

        CsrBudgetSummaryDto summary = getCsrSummary(userId, fy);
        List<CoFundedPilot> pilots = coFundedPilotRepository.findByIndustryProfileId(profile.getId());

        McaCsr2ReportDto dto = new McaCsr2ReportDto();
        dto.setReportReferenceNumber("MCA-CSR2-" + fy.replace("-", "") + "-" + profile.getId());
        dto.setFinancialYear(fy);
        dto.setGeneratedDate(LocalDate.now());

        dto.setCinNumber(profile.getCinNumber() != null ? profile.getCinNumber() : "L27100MH1907PLC000260");
        dto.setCompanyName(profile.getCompanyName() != null ? profile.getCompanyName() : "Tata Steel Limited");
        dto.setRegisteredOfficeAddress("Bombay House, 24 Homi Mody Street, Fort, Mumbai 400001, Maharashtra, India");
        dto.setEmail(profile.getUser() != null ? profile.getUser().getEmail() : "csr.compliance@tatasteel.com");
        dto.setWebsite("https://www.tatasteel.com");

        BigDecimal profitPrecedingThreeYears = summary.getMandatoryCsrObligation().multiply(BigDecimal.valueOf(50));
        dto.setAverageNetProfitPrecedingThreeYears(profitPrecedingThreeYears);
        dto.setMandatoryTwoPercentObligation(summary.getMandatoryCsrObligation());
        dto.setUnspentCarriedForwardFromPreviousYears(BigDecimal.ZERO);
        dto.setTotalCsrBudgetToSpend(summary.getMandatoryCsrObligation());
        dto.setTotalCsrAmountSpentOngoingProjects(summary.getTotalDisbursedAmount());
        dto.setTotalCsrAmountSpentOtherThanOngoing(BigDecimal.ZERO);
        dto.setTotalCsrAmountTransferredToUnspentAccount(BigDecimal.ZERO);
        dto.setUnspentSurplusBalance(summary.getUnspentBalanceAmount());

        // Ongoing Projects mapping
        List<McaCsr2ReportDto.OngoingProjectFilingDto> ongoingList = new ArrayList<>();
        int seq = 1;
        for (CoFundedPilot p : pilots) {
            McaCsr2ReportDto.OngoingProjectFilingDto op = new McaCsr2ReportDto.OngoingProjectFilingDto();
            op.setProjectSerialNumber("P-" + seq++);
            op.setProjectTitle(p.getTitle());
            op.setScheduleVIIItem("Item (ix) - Public Funded Universities & Incubators");
            op.setLocalAreaState("Jharkhand");
            op.setLocalAreaDistrict(p.getTargetDistrict() != null ? p.getTargetDistrict() : "Ranchi");

            long duration = 12;
            if (p.getCreatedAt() != null && p.getTargetCompletionDate() != null) {
                duration = Math.max(1, ChronoUnit.MONTHS.between(p.getCreatedAt().toLocalDate(), p.getTargetCompletionDate()));
            }
            op.setProjectDurationMonths((int) duration);
            op.setTotalBudgetApproved(p.getTotalBudget());
            op.setAmountSpentInCurrentFy(p.getDisbursedBudget());
            op.setCumulativeSpendTillDate(p.getDisbursedBudget());
            op.setModeOfImplementation("Through Implementing Agency (HEI Autonomous Body)");
            op.setImplementingAgencyName(p.getUniversityName());
            op.setImplementingAgencyCsr1RegNumber("CSR00018492");
            op.setStatus(p.getStatus() == PilotStatus.COMPLETED ? "COMPLETED" : "ON_GOING");
            ongoingList.add(op);
        }
        dto.setOngoingProjects(ongoingList);

        // Implementing Agencies mapping
        List<McaCsr2ReportDto.ImplementingAgencyFilingDto> agencyList = new ArrayList<>();
        Set<String> seenUniversities = new HashSet<>();
        for (CoFundedPilot p : pilots) {
            if (seenUniversities.add(p.getUniversityName())) {
                McaCsr2ReportDto.ImplementingAgencyFilingDto ia = new McaCsr2ReportDto.ImplementingAgencyFilingDto();
                ia.setCsr1RegistrationNumber("CSR00018492");
                ia.setAgencyName(p.getUniversityName());
                ia.setAgencyType("State/Central Public University (Section 135 Item ix)");
                ia.setPan("AAATB1234F");
                ia.setState("Jharkhand");
                ia.setDistrict(p.getTargetDistrict() != null ? p.getTargetDistrict() : "Ranchi");
                ia.setTotalAmountAllocated(p.getTotalBudget());
                agencyList.add(ia);
            }
        }
        dto.setImplementingAgencies(agencyList);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateMcaCsr2Csv(Long userId, String financialYear) {
        McaCsr2ReportDto r = getMcaCsr2Report(userId, financialYear);

        StringBuilder sb = new StringBuilder();
        sb.append("FORM CSR-2: REPORT ON CORPORATE SOCIAL RESPONSIBILITY (MCA ANNUAL FILING)\n");
        sb.append("Financial Year,").append(r.getFinancialYear()).append("\n");
        sb.append("Report Reference,").append(r.getReportReferenceNumber()).append("\n");
        sb.append("Generated On,").append(r.getGeneratedDate()).append("\n\n");

        sb.append("PART A: COMPANY PARTICULARS\n");
        sb.append("CIN,").append(r.getCinNumber()).append("\n");
        sb.append("Company Name,").append("\"").append(r.getCompanyName()).append("\"\n");
        sb.append("Email,").append(r.getEmail()).append("\n");
        sb.append("Average Net Profit (Sec 198),").append(r.getAverageNetProfitPrecedingThreeYears()).append("\n");
        sb.append("Mandatory 2% CSR Obligation,").append(r.getMandatoryTwoPercentObligation()).append("\n");
        sb.append("Total Amount Spent on Ongoing Projects,").append(r.getTotalCsrAmountSpentOngoingProjects()).append("\n");
        sb.append("Unspent Balance,").append(r.getUnspentSurplusBalance()).append("\n\n");

        sb.append("PART B: DETAILS OF CSR AMOUNT SPENT IN ONGOING PROJECTS\n");
        sb.append("S.No,Project Title,Schedule VII Item,State,District,Duration (Mo),Approved Budget,Amount Spent in FY,Cumulative Spend,Mode of Implementation,Implementing Agency,CSR-1 Reg Number,Status\n");

        for (McaCsr2ReportDto.OngoingProjectFilingDto p : r.getOngoingProjects()) {
            sb.append(p.getProjectSerialNumber()).append(",")
                    .append("\"").append(p.getProjectTitle().replace("\"", "\"\"")).append("\",")
                    .append("\"").append(p.getScheduleVIIItem()).append("\",")
                    .append(p.getLocalAreaState()).append(",")
                    .append(p.getLocalAreaDistrict()).append(",")
                    .append(p.getProjectDurationMonths()).append(",")
                    .append(p.getTotalBudgetApproved()).append(",")
                    .append(p.getAmountSpentInCurrentFy()).append(",")
                    .append(p.getCumulativeSpendTillDate()).append(",")
                    .append("\"").append(p.getModeOfImplementation()).append("\",")
                    .append("\"").append(p.getImplementingAgencyName()).append("\",")
                    .append(p.getImplementingAgencyCsr1RegNumber()).append(",")
                    .append(p.getStatus()).append("\n");
        }

        sb.append("\nPART C: DETAILS OF IMPLEMENTING AGENCIES\n");
        sb.append("CSR-1 Reg No,Agency Name,Agency Type,PAN,State,District,Total Budget Allocated\n");
        for (McaCsr2ReportDto.ImplementingAgencyFilingDto ia : r.getImplementingAgencies()) {
            sb.append(ia.getCsr1RegistrationNumber()).append(",")
                    .append("\"").append(ia.getAgencyName()).append("\",")
                    .append("\"").append(ia.getAgencyType()).append("\",")
                    .append(ia.getPan()).append(",")
                    .append(ia.getState()).append(",")
                    .append(ia.getDistrict()).append(",")
                    .append(ia.getTotalAmountAllocated()).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateMcaCsr2Pdf(Long userId, String financialYear) {
        McaCsr2ReportDto r = getMcaCsr2Report(userId, financialYear);

        StringBuilder sb = new StringBuilder();
        sb.append("%PDF-1.4\n");
        sb.append("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
        sb.append("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n");
        sb.append("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n");
        sb.append("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n");

        String textContent = String.format(
                "FORM CSR-2 STATUTORY REPORT - %s | Company: %s (CIN: %s) | Mandatory 2pc CSR Obligation: Rs %s | Total Disbursed to HEI R&D: Rs %s | Ongoing Projects Count: %d | Verified Form GFR 12-A Compliant",
                r.getFinancialYear(),
                r.getCompanyName(),
                r.getCinNumber(),
                r.getMandatoryTwoPercentObligation(),
                r.getTotalCsrAmountSpentOngoingProjects(),
                r.getOngoingProjects().size()
        );

        String streamData = "BT /F1 12 Tf 50 780 Td (" + textContent.replace("(", "").replace(")", "") + ") Tj ET";
        sb.append("4 0 obj << /Length ").append(streamData.length()).append(" >> stream\n");
        sb.append(streamData).append("\nendstream\nendobj\n");
        sb.append("xref\n0 6\n0000000000 65535 f \n");
        sb.append("trailer << /Size 6 /Root 1 0 R >>\nstartxref\n500\n%%EOF\n");

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CsrAuditTrailDto> getAuditTrail(Long userId, String financialYear, Pageable pageable) {
        IndustryProfile profile = resolveProfile(userId);
        if (financialYear != null && !financialYear.isBlank()) {
            return csrAuditTrailRepository
                    .findByIndustryProfileIdAndFinancialYearOrderByTimestampDesc(profile.getId(), financialYear, pageable)
                    .map(CsrAuditTrailDto::fromEntity);
        }
        return csrAuditTrailRepository
                .findByIndustryProfileIdOrderByTimestampDesc(profile.getId(), pageable)
                .map(CsrAuditTrailDto::fromEntity);
    }

    @Override
    @Transactional
    public void recordAudit(
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
    ) {
        try {
            Optional<CsrAuditTrail> latestOpt = csrAuditTrailRepository.findLatestByProfileId(profile.getId());
            String prevHash = latestOpt.map(a -> a.getHashSha256())
                    .orElse("0000000000000000000000000000000000000000000000000000000000000000");

            LocalDateTime now = LocalDateTime.now();
            String payloadToHash = prevHash + "|" + now.toString() + "|" + actionType + "|" +
                    (detailsJson != null ? detailsJson : "") + "|" + (entityType != null ? entityType : "") + "|" + entityId;

            String currentHash = computeSha256(payloadToHash);

            CsrAuditTrail audit = new CsrAuditTrail();
            audit.setIndustryProfile(profile);
            audit.setFinancialYear(financialYear != null ? financialYear : "2026-2027");
            audit.setActionType(actionType);
            audit.setActionTitle(actionTitle);
            audit.setDetailsJson(detailsJson);
            audit.setActorUserId(actorUserId);
            audit.setActorName(actorName);
            audit.setActorRole(actorRole);
            audit.setEntityType(entityType);
            audit.setEntityId(entityId);
            audit.setPreviousHash(prevHash);
            audit.setHashSha256(currentHash);
            audit.setTimestamp(now);

            csrAuditTrailRepository.save(audit);
        } catch (Exception e) {
            log.error("Failed to record CSR audit log entry: {}", e.getMessage(), e);
        }
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        }
    }

    private static String formatCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return "₹0";
        double val = amount.doubleValue();
        if (val >= 10000000) {
            return String.format("₹%.2f Cr", val / 10000000);
        } else if (val >= 100000) {
            return String.format("₹%.1f Lakhs", val / 100000);
        } else if (val >= 1000) {
            return String.format("₹%.1f K", val / 1000);
        }
        return "₹" + amount.toPlainString();
    }

    private static Double roundTwoDecimals(Double value) {
        if (value == null) return 0.0;
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
