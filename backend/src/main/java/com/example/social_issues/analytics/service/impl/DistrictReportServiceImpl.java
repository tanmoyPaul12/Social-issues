package com.example.social_issues.analytics.service.impl;

import com.example.social_issues.analytics.dto.*;
import com.example.social_issues.analytics.service.DistrictReportService;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.problemsubmission.repository.GrassrootIssueRepository;
import com.example.social_issues.projectlifecycle.model.IntellectualPropertyRecord;
import com.example.social_issues.projectlifecycle.model.IpStatus;
import com.example.social_issues.projectlifecycle.repository.IntellectualPropertyRepository;
import com.example.social_issues.projectlifecycle.repository.ProjectMilestoneRepository;
import com.example.social_issues.projectlifecycle.repository.StageApprovalSignoffRepository;
import com.example.social_issues.universitycollab.model.UniversityProject;
import com.example.social_issues.universitycollab.model.UniversityProjectStage;
import com.example.social_issues.universitycollab.repository.UniversityProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DistrictReportServiceImpl implements DistrictReportService {

    public static final List<String> ALL_JHARKHAND_DISTRICTS = List.of(
            "Ranchi", "Dhanbad", "East Singhbhum", "Bokaro", "Hazaribagh",
            "Deoghar", "Palamu", "Dumka", "Giridih", "Ramgarh",
            "West Singhbhum", "Latehar", "Sahibganj", "Khunti", "Gumla",
            "Simdega", "Garhwa", "Godda", "Chatra", "Koderma",
            "Jamtara", "Pakur", "Lohardaga", "Saraikela"
    );

    public static final List<String> OFFICIAL_DOMAINS = List.of(
            "Agriculture", "Water Resources", "Healthcare", "Clean Energy",
            "Education", "Rural Infra", "Sanitation", "Environment",
            "Public Admin", "Livelihoods"
    );

    public static final int SYSTEM_INCEPTION_YEAR = 2026;

    private final GrassrootIssueRepository issueRepository;
    private final UniversityProjectRepository projectRepository;
    private final IntellectualPropertyRepository ipRepository;


    public DistrictReportServiceImpl(
            GrassrootIssueRepository issueRepository,
            UniversityProjectRepository projectRepository,
            IntellectualPropertyRepository ipRepository,
            ProjectMilestoneRepository milestoneRepository,
            StageApprovalSignoffRepository signoffRepository
    ) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.ipRepository = ipRepository;

    }

    @Override
    @Transactional(readOnly = true)
    public DistrictReportSummaryResponse getDistrictReportSummary(DistrictReportFilterRequest filter) {
        DateRangeHolder range = resolveDateRange(filter);

        String districtFilter = (filter.getDistrict() != null && !filter.getDistrict().equalsIgnoreCase("ALL"))
                ? filter.getDistrict().trim() : null;

        IssueSector sectorFilter = parseIssueSector(filter.getSector());
        String domainFilter = (filter.getSector() != null && !filter.getSector().equalsIgnoreCase("ALL"))
                ? filter.getSector().trim() : null;

        // Fetch filtered datasets
        List<GrassrootIssue> issues = issueRepository.findByDateRangeAndFilters(
                range.startDateTime, range.endDateTime, districtFilter, sectorFilter);

        List<UniversityProject> projects = projectRepository.findByDateRangeAndFilters(
                range.startDateTime, range.endDateTime, districtFilter, domainFilter);

        List<IntellectualPropertyRecord> ipRecords = ipRepository.findByDateRange(
                range.startDateTime, range.endDateTime);

        // Map projects to their IP records
        Map<Long, List<IntellectualPropertyRecord>> ipByProject = ipRecords.stream()
                .filter(ip -> ip != null && ip.getProjectId() != null)
                .collect(Collectors.groupingBy(ip -> ip.getProjectId()));

        // Group by District
        List<String> targetDistricts = (districtFilter != null)
                ? List.of(districtFilter)
                : ALL_JHARKHAND_DISTRICTS;

        List<DistrictReportRowDto> districtRows = new ArrayList<>();

        long totalSubmitted = 0;
        long totalTriaged = 0;
        long totalAssigned = 0;
        long totalResolved = 0;
        long totalActiveProj = 0;
        long totalCompletedProj = 0;
        long totalPatents = 0;
        long totalPatentsGranted = 0;
        BigDecimal totalCsr = BigDecimal.ZERO;
        Set<String> statewideHeis = new HashSet<>();

        for (String dist : targetDistricts) {
            DistrictReportRowDto row = new DistrictReportRowDto(dist);

            List<GrassrootIssue> distIssues = issues.stream()
                    .filter(i -> i.getDistrict() != null && i.getDistrict().equalsIgnoreCase(dist))
                    .toList();

            List<UniversityProject> distProjects = projects.stream()
                    .filter(p -> p.getDistrict() != null && p.getDistrict().equalsIgnoreCase(dist))
                    .toList();

            long submitted = distIssues.size();
            long triaged = distIssues.stream()
                    .filter(i -> i.getStatus() != IssueStatus.SUBMITTED && i.getStatus() != IssueStatus.REJECTED)
                    .count();
            long assigned = distIssues.stream()
                    .filter(i -> i.getStatus() == IssueStatus.ASSIGNED_HEI || i.getAssignedHEI() != null)
                    .count();
            long resolved = distIssues.stream()
                    .filter(i -> i.getStatus() == IssueStatus.RESOLVED)
                    .count();

            double resRate = submitted > 0 ? (double) resolved / submitted * 100.0 : 0.0;

            row.setChallengesSubmitted(submitted);
            row.setChallengesTriaged(triaged);
            row.setChallengesAssignedHEI(assigned);
            row.setChallengesResolved(resolved);
            row.setResolutionRate(Math.round(resRate * 100.0) / 100.0);

            long activeProj = distProjects.stream()
                    .filter(p -> p.getStage() != UniversityProjectStage.COMPLETED)
                    .count();
            long completedProj = distProjects.stream()
                    .filter(p -> p.getStage() == UniversityProjectStage.COMPLETED || p.getStage() == UniversityProjectStage.DEPLOYMENT_HANDOVER)
                    .count();

            row.setActiveProjects(activeProj);
            row.setCompletedProjects(completedProj);

            // Determine participating universities
            Set<String> universities = distProjects.stream()
                    .map(p -> p != null ? p.getUniversityName() : null)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            row.setParticipatingUniversities(new ArrayList<>(universities));
            statewideHeis.addAll(universities);

            // TRL metrics
            int highestTrl = 1;
            double avgTrl = 1.0;
            if (!distProjects.isEmpty()) {
                double trlSum = 0;
                for (UniversityProject p : distProjects) {
                    int pTrl = calculateProjectTrl(p);
                    if (pTrl > highestTrl) highestTrl = pTrl;
                    trlSum += pTrl;
                }
                avgTrl = trlSum / distProjects.size();
            }
            row.setAvgTrlLevel(Math.round(avgTrl * 10.0) / 10.0);
            row.setHighestTrl(highestTrl);

            // IP & Patents for district projects
            long distPatents = 0;
            long distPatentsGranted = 0;
            BigDecimal distCsr = BigDecimal.ZERO;

            for (UniversityProject p : distProjects) {
                if (p.getCsrFundedAmount() != null) {
                    distCsr = distCsr.add(p.getCsrFundedAmount());
                } else if (p.getAllocatedGrant() != null) {
                    distCsr = distCsr.add(p.getAllocatedGrant());
                }

                List<IntellectualPropertyRecord> projIps = ipByProject.getOrDefault(p.getId(), Collections.emptyList());
                distPatents += projIps.size();
                distPatentsGranted += projIps.stream().filter(ip -> ip.getStatus() == IpStatus.GRANTED).count();
            }

            row.setPatentsFiled(distPatents);
            row.setPatentsGranted(distPatentsGranted);
            row.setCsrFundsAllocatedInr(distCsr);

            // Top Sector / Domain in District
            Map<String, Long> sectorCounts = distIssues.stream()
                    .filter(i -> i.getSector() != null)
                    .collect(Collectors.groupingBy(i -> i.getSector().name(), Collectors.counting()));

            String topSector = sectorCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(e -> e.getKey())
                    .orElse("Agriculture");
            row.setTopDomainNeed(topSector);

            districtRows.add(row);

            totalSubmitted += submitted;
            totalTriaged += triaged;
            totalAssigned += assigned;
            totalResolved += resolved;
            totalActiveProj += activeProj;
            totalCompletedProj += completedProj;
            totalPatents += distPatents;
            totalPatentsGranted += distPatentsGranted;
            totalCsr = totalCsr.add(distCsr);
        }

        // Sort rows by submitted count descending
        districtRows.sort((a, b) -> Long.compare(b.getChallengesSubmitted(), a.getChallengesSubmitted()));

        DistrictReportSummaryResponse response = new DistrictReportSummaryResponse();
        response.setPeriodLabel(range.label);
        response.setPeriodType(filter.getPeriodType());
        response.setStartDate(range.startDate);
        response.setEndDate(range.endDate);
        response.setSelectedDistrict(filter.getDistrict());
        response.setSelectedSector(filter.getSector());

        response.setTotalGrievancesSubmitted(totalSubmitted);
        response.setTotalGrievancesTriaged(totalTriaged);
        response.setTotalGrievancesAssignedHEI(totalAssigned);
        response.setTotalGrievancesResolved(totalResolved);

        double stateResRate = totalSubmitted > 0 ? (double) totalResolved / totalSubmitted * 100.0 : 0.0;
        response.setStatewideResolutionRate(Math.round(stateResRate * 100.0) / 100.0);

        response.setTotalActiveProjects(totalActiveProj);
        response.setTotalCompletedProjects(totalCompletedProj);
        response.setTotalPatentsFiled(totalPatents);
        response.setTotalPatentsGranted(totalPatentsGranted);
        response.setTotalCsrAllocatedInr(totalCsr);
        response.setTotalParticipatingUniversitiesCount(statewideHeis.size());

        int stateHighestTrl = districtRows.stream().mapToInt(r -> r.getHighestTrl()).max().orElse(1);
        double stateAvgTrl = districtRows.stream().mapToDouble(r -> r.getAvgTrlLevel()).average().orElse(1.0);
        response.setStatewideHighestTrl(stateHighestTrl);
        response.setOverallAvgTrl(Math.round(stateAvgTrl * 10.0) / 10.0);

        response.setDistrictBreakdown(districtRows);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateDistrictReportCsv(DistrictReportFilterRequest filter) {
        DateRangeHolder range = resolveDateRange(filter);
        ReportType rType = filter.getReportType() != null ? filter.getReportType() : ReportType.DISTRICT_SUMMARY;

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8);

        // UTF-8 BOM for Excel compatibility
        out.write(0xEF);
        out.write(0xBB);
        out.write(0xBF);

        if (rType == ReportType.PROJECT_LIFECYCLES) {
            writeProjectsCsv(writer, filter, range);
        } else if (rType == ReportType.IP_AND_PATENTS) {
            writeIpCsv(writer, filter, range);
        } else if (rType == ReportType.CHALLENGE_INCIDENTS) {
            writeIssuesCsv(writer, filter, range);
        } else {
            writeDistrictSummaryCsv(writer, filter, range);
        }

        writer.flush();
        return out.toByteArray();
    }

    @Override
    public String generateCsvFilename(DistrictReportFilterRequest filter) {
        DateRangeHolder range = resolveDateRange(filter);
        String dist = (filter.getDistrict() != null && !filter.getDistrict().equalsIgnoreCase("ALL"))
                ? filter.getDistrict().replace(" ", "_")
                : "All_Districts";
        String rType = filter.getReportType() != null ? filter.getReportType().name() : "SUMMARY";
        String cleanLabel = range.label.replaceAll("[^a-zA-Z0-9_-]", "_");

        return String.format("JH_Report_%s_%s_%s.csv", rType, dist, cleanLabel);
    }

    @Override
    public ReportPeriodOptionsDto getReportPeriodOptions() {
        ReportPeriodOptionsDto dto = new ReportPeriodOptionsDto();

        int currentYear = LocalDate.now().getYear();
        int month = LocalDate.now().getMonthValue();

        // Calculate current financial year
        int fyStart = (month >= 4) ? currentYear : currentYear - 1;
        String curFy = String.format("%d-%s", fyStart, String.valueOf(fyStart + 1).substring(2));

        List<String> fyList = new ArrayList<>();
        for (int y = fyStart; y >= SYSTEM_INCEPTION_YEAR; y--) {
            fyList.add(String.format("%d-%s", y, String.valueOf(y + 1).substring(2)));
        }
        dto.setAvailableFinancialYears(fyList);
        dto.setCurrentFinancialYear(curFy);

        // Current quarter
        String curQ = "Q1";
        if (month >= 4 && month <= 6) curQ = "Q1";
        else if (month >= 7 && month <= 9) curQ = "Q2";
        else if (month >= 10 && month <= 12) curQ = "Q3";
        else curQ = "Q4";
        dto.setCurrentQuarter(curQ);

        dto.setQuarters(List.of(
                new ReportPeriodOptionsDto.PeriodItemDto("Q1", "Q1 (Apr - Jun)"),
                new ReportPeriodOptionsDto.PeriodItemDto("Q2", "Q2 (Jul - Sep)"),
                new ReportPeriodOptionsDto.PeriodItemDto("Q3", "Q3 (Oct - Dec)"),
                new ReportPeriodOptionsDto.PeriodItemDto("Q4", "Q4 (Jan - Mar)")
        ));

        dto.setHalfYears(List.of(
                new ReportPeriodOptionsDto.PeriodItemDto("H1", "H1 (Apr - Sep)"),
                new ReportPeriodOptionsDto.PeriodItemDto("H2", "H2 (Oct - Mar)")
        ));

        List<ReportPeriodOptionsDto.PeriodItemDto> months = new ArrayList<>();
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        for (int i = 1; i <= 12; i++) {
            months.add(new ReportPeriodOptionsDto.PeriodItemDto(String.valueOf(i), monthNames[i - 1]));
        }
        dto.setMonths(months);

        dto.setDistricts(ALL_JHARKHAND_DISTRICTS);
        dto.setDomains(OFFICIAL_DOMAINS);
        return dto;
    }

    // --- Private CSV Writers ---

    private void writeDistrictSummaryCsv(PrintWriter writer, DistrictReportFilterRequest filter, DateRangeHolder range) {
        DistrictReportSummaryResponse summary = getDistrictReportSummary(filter);

        writer.println("JHARKHAND STATE GOVERNMENT - DISTRICT-WISE INNOVATION & GRIEVANCE REPORT");
        writer.println(String.format("Reporting Period: \"%s\"", summary.getPeriodLabel()));
        writer.println(String.format("Date Range: %s to %s", summary.getStartDate(), summary.getEndDate()));
        writer.println(String.format("Generated On: %s", LocalDate.now()));
        writer.println();

        // CSV Header
        writer.println("District,Total Challenges,Triaged & Verified,Assigned to HEI,Resolved & Closed,Resolution Rate (%),Active R&D Projects,Completed Projects,Average TRL,Highest TRL,Patents Filed,Patents Granted,CSR Funds Allocated (INR),Top Domain Need,Participating Universities");

        for (DistrictReportRowDto r : summary.getDistrictBreakdown()) {
            writer.println(String.join(",",
                    csvEscape(r.getDistrict()),
                    String.valueOf(r.getChallengesSubmitted()),
                    String.valueOf(r.getChallengesTriaged()),
                    String.valueOf(r.getChallengesAssignedHEI()),
                    String.valueOf(r.getChallengesResolved()),
                    String.format(Locale.US, "%.2f%%", r.getResolutionRate()),
                    String.valueOf(r.getActiveProjects()),
                    String.valueOf(r.getCompletedProjects()),
                    String.format(Locale.US, "TRL %.1f", r.getAvgTrlLevel()),
                    String.format(Locale.US, "TRL %d", r.getHighestTrl()),
                    String.valueOf(r.getPatentsFiled()),
                    String.valueOf(r.getPatentsGranted()),
                    r.getCsrFundsAllocatedInr() != null ? r.getCsrFundsAllocatedInr().toPlainString() : "0",
                    csvEscape(r.getTopDomainNeed() != null ? r.getTopDomainNeed() : "-"),
                    csvEscape(r.getParticipatingUniversities() != null ? String.join("; ", r.getParticipatingUniversities()) : "-")
            ));
        }

        // Summary Total Row
        writer.println();
        writer.println(String.join(",",
                "STATEWIDE TOTALS",
                String.valueOf(summary.getTotalGrievancesSubmitted()),
                String.valueOf(summary.getTotalGrievancesTriaged()),
                String.valueOf(summary.getTotalGrievancesAssignedHEI()),
                String.valueOf(summary.getTotalGrievancesResolved()),
                String.format(Locale.US, "%.2f%%", summary.getStatewideResolutionRate()),
                String.valueOf(summary.getTotalActiveProjects()),
                String.valueOf(summary.getTotalCompletedProjects()),
                String.format(Locale.US, "TRL %.1f", summary.getOverallAvgTrl()),
                String.format(Locale.US, "TRL %d", summary.getStatewideHighestTrl()),
                String.valueOf(summary.getTotalPatentsFiled()),
                String.valueOf(summary.getTotalPatentsGranted()),
                summary.getTotalCsrAllocatedInr() != null ? summary.getTotalCsrAllocatedInr().toPlainString() : "0",
                "-",
                String.format("%d Universities", summary.getTotalParticipatingUniversitiesCount())
        ));
    }

    private void writeProjectsCsv(PrintWriter writer, DistrictReportFilterRequest filter, DateRangeHolder range) {
        String districtFilter = (filter.getDistrict() != null && !filter.getDistrict().equalsIgnoreCase("ALL"))
                ? filter.getDistrict().trim() : null;
        String domainFilter = (filter.getSector() != null && !filter.getSector().equalsIgnoreCase("ALL"))
                ? filter.getSector().trim() : null;

        List<UniversityProject> projects = projectRepository.findByDateRangeAndFilters(
                range.startDateTime, range.endDateTime, districtFilter, domainFilter);

        writer.println("JHARKHAND STATE GOVERNMENT - UNIVERSITY R&D PROJECTS & TRL REPORT");
        writer.println(String.format("Reporting Period: \"%s\"", range.label));
        writer.println(String.format("District Filter: %s", filter.getDistrict() != null ? filter.getDistrict() : "All Districts"));
        writer.println();

        writer.println("Project Code,Project Title,University Name,District,Research Domain,TRL Level,Progress (%),Stage,Faculty Mentor,Student Lead,CSR / Grant Amount (INR),Sponsor Partner,Citizen Verification Status,Created Date");

        for (UniversityProject p : projects) {
            int trl = calculateProjectTrl(p);
            writer.println(String.join(",",
                    csvEscape(p.getProjectCode() != null ? p.getProjectCode() : "JH-RND-" + p.getId()),
                    csvEscape(p.getTitle()),
                    csvEscape(p.getUniversityName()),
                    csvEscape(p.getDistrict() != null ? p.getDistrict() : "Jharkhand"),
                    csvEscape(p.getDomain() != null ? p.getDomain() : "General"),
                    String.format(Locale.US, "TRL %d", trl),
                    String.format(Locale.US, "%d%%", p.getProgressPercentage() != null ? p.getProgressPercentage() : 20),
                    csvEscape(p.getStage() != null ? p.getStage().name() : "IN_PROGRESS"),
                    csvEscape(p.getLeadFacultyMentor() != null ? p.getLeadFacultyMentor() : "-"),
                    csvEscape(p.getLeadStudentInnovator() != null ? p.getLeadStudentInnovator() : "-"),
                    p.getAllocatedGrant() != null ? p.getAllocatedGrant().toPlainString() : (p.getCsrFundedAmount() != null ? p.getCsrFundedAmount().toPlainString() : "0"),
                    csvEscape(p.getCsrSponsorCompany() != null ? p.getCsrSponsorCompany() : "-"),
                    csvEscape(p.getCitizenVerificationStatus() != null ? p.getCitizenVerificationStatus() : "PENDING"),
                    p.getCreatedAt() != null ? p.getCreatedAt().toLocalDate().toString() : "-"
            ));
        }
    }

    private void writeIpCsv(PrintWriter writer, DistrictReportFilterRequest filter, DateRangeHolder range) {
        List<IntellectualPropertyRecord> ips = ipRepository.findByDateRange(
                range.startDateTime, range.endDateTime);

        writer.println("JHARKHAND STATE GOVERNMENT - INTELLECTUAL PROPERTY & PATENTS REGISTER");
        writer.println(String.format("Reporting Period: \"%s\"", range.label));
        writer.println();

        writer.println("Patent / Disclosure Title,IP Type,Status,Patent Application No,Filing Date,Grant Date,Patent Office,HEI Share (%),Innovators Share (%),Industry Share (%),Inventors List,Commercial Partner");

        for (IntellectualPropertyRecord ip : ips) {
            writer.println(String.join(",",
                    csvEscape(ip.getTitle()),
                    csvEscape(ip.getIpType() != null ? ip.getIpType().name() : "-"),
                    csvEscape(ip.getStatus() != null ? ip.getStatus().name() : "DISCLOSED"),
                    csvEscape(ip.getPatentApplicationNumber() != null ? ip.getPatentApplicationNumber() : "PENDING"),
                    ip.getFilingDate() != null ? ip.getFilingDate().toString() : "-",
                    ip.getGrantDate() != null ? ip.getGrantDate().toString() : "-",
                    csvEscape(ip.getPatentOffice() != null ? ip.getPatentOffice() : "IPO Kolkata"),
                    String.format(Locale.US, "%d%%", ip.getHeiOwnershipShare() != null ? ip.getHeiOwnershipShare() : 0),
                    String.format(Locale.US, "%d%%", ip.getStudentInnovatorsShare() != null ? ip.getStudentInnovatorsShare() : 0),
                    String.format(Locale.US, "%d%%", ip.getIndustryPartnerShare() != null ? ip.getIndustryPartnerShare() : 0),
                    csvEscape(ip.getInventorsList() != null ? ip.getInventorsList() : "-"),
                    csvEscape(ip.getCommercialPartnerName() != null ? ip.getCommercialPartnerName() : "-")
            ));
        }
    }

    private void writeIssuesCsv(PrintWriter writer, DistrictReportFilterRequest filter, DateRangeHolder range) {
        String districtFilter = (filter.getDistrict() != null && !filter.getDistrict().equalsIgnoreCase("ALL"))
                ? filter.getDistrict().trim() : null;
        IssueSector sectorFilter = parseIssueSector(filter.getSector());

        List<GrassrootIssue> issues = issueRepository.findByDateRangeAndFilters(
                range.startDateTime, range.endDateTime, districtFilter, sectorFilter);

        writer.println("JHARKHAND STATE GOVERNMENT - CITIZEN CHALLENGES & GRIEVANCE RESOLUTION AUDIT");
        writer.println(String.format("Reporting Period: \"%s\"", range.label));
        writer.println(String.format("District: %s", filter.getDistrict() != null ? filter.getDistrict() : "All Districts"));
        writer.println();

        writer.println("Ticket ID,Problem Title,District,Block,Sector,Priority,Status,Validation Status,Assigned HEI,Submitted Date");

        for (GrassrootIssue i : issues) {
            writer.println(String.join(",",
                    csvEscape(i.getIssueNumber() != null ? i.getIssueNumber() : "GRI-" + i.getId()),
                    csvEscape(i.getTitle()),
                    csvEscape(i.getDistrict() != null ? i.getDistrict() : "-"),
                    csvEscape(i.getBlock() != null ? i.getBlock() : "-"),
                    csvEscape(i.getSector() != null ? i.getSector().name() : "OTHER"),
                    csvEscape(i.getPriority() != null ? i.getPriority().name() : "MEDIUM"),
                    csvEscape(i.getStatus() != null ? i.getStatus().name() : "SUBMITTED"),
                    csvEscape(i.getValidationStatus() != null ? i.getValidationStatus() : "PASS"),
                    csvEscape(i.getAssignedHEI() != null ? i.getAssignedHEI() : "-"),
                    i.getCreatedAt() != null ? i.getCreatedAt().toLocalDate().toString() : "-"
            ));
        }
    }

    // --- Helper Utilities ---

    private int calculateProjectTrl(UniversityProject p) {
        if (p.getStage() == null) return 1;
        return switch (p.getStage()) {
            case TEAM_FORMATION -> 2;
            case LAB_PROTOTYPING -> 4;
            case FIELD_PILOT -> 6;
            case DEPLOYMENT_HANDOVER -> 8;
            case COMPLETED -> 9;
        };
    }

    private String csvEscape(String text) {
        if (text == null) return "\"\"";
        String clean = text.replace("\"", "\"\"");
        return "\"" + clean + "\"";
    }

    private IssueSector parseIssueSector(String rawSector) {
        if (rawSector == null || rawSector.equalsIgnoreCase("ALL") || rawSector.trim().isEmpty()) {
            return null;
        }
        try {
            return IssueSector.valueOf(rawSector.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            // Map common display names
            String upper = rawSector.toUpperCase();
            if (upper.contains("WATER")) return IssueSector.WATER;
            if (upper.contains("HEALTH")) return IssueSector.HEALTH;
            if (upper.contains("AGRICULTURE") || upper.contains("AGRI")) return IssueSector.AGRICULTURE;
            if (upper.contains("ENERGY") || upper.contains("POWER")) return IssueSector.ELECTRICITY;
            if (upper.contains("EDUCATION")) return IssueSector.EDUCATION;
            if (upper.contains("SANITATION")) return IssueSector.SANITATION;
            if (upper.contains("INFRA")) return IssueSector.INFRASTRUCTURE;
            if (upper.contains("ENV")) return IssueSector.ENVIRONMENT;
            if (upper.contains("LIVELIHOOD")) return IssueSector.LIVELIHOOD;
            if (upper.contains("GOV")) return IssueSector.GOVERNANCE;
            return null;
        }
    }

    private static class DateRangeHolder {
        LocalDate startDate;
        LocalDate endDate;
        LocalDateTime startDateTime;
        LocalDateTime endDateTime;
        String label;
    }

    private DateRangeHolder resolveDateRange(DistrictReportFilterRequest filter) {
        DateRangeHolder h = new DateRangeHolder();
        ReportPeriodType pType = filter.getPeriodType() != null ? filter.getPeriodType() : ReportPeriodType.FINANCIAL_YEAR;

        int currentYear = LocalDate.now().getYear();
        int month = LocalDate.now().getMonthValue();
        int defaultFyStart = (month >= 4) ? currentYear : currentYear - 1;

        int fyStartYear = defaultFyStart;
        if (filter.getFinancialYear() != null && filter.getFinancialYear().contains("-")) {
            try {
                fyStartYear = Integer.parseInt(filter.getFinancialYear().split("-")[0].trim());
            } catch (Exception ignored) {}
        }

        switch (pType) {
            case QUARTERLY -> {
                String q = (filter.getQuarter() != null && !filter.getQuarter().isBlank())
                        ? filter.getQuarter().toUpperCase().trim() : "Q1";
                switch (q) {
                    case "Q2" -> {
                        h.startDate = LocalDate.of(fyStartYear, 7, 1);
                        h.endDate = LocalDate.of(fyStartYear, 9, 30);
                        h.label = String.format("FY %d-%s Q2 (Jul - Sep %d)", fyStartYear, String.valueOf(fyStartYear + 1).substring(2), fyStartYear);
                    }
                    case "Q3" -> {
                        h.startDate = LocalDate.of(fyStartYear, 10, 1);
                        h.endDate = LocalDate.of(fyStartYear, 12, 31);
                        h.label = String.format("FY %d-%s Q3 (Oct - Dec %d)", fyStartYear, String.valueOf(fyStartYear + 1).substring(2), fyStartYear);
                    }
                    case "Q4" -> {
                        h.startDate = LocalDate.of(fyStartYear + 1, 1, 1);
                        h.endDate = LocalDate.of(fyStartYear + 1, 3, 31);
                        h.label = String.format("FY %d-%s Q4 (Jan - Mar %d)", fyStartYear, String.valueOf(fyStartYear + 1).substring(2), fyStartYear + 1);
                    }
                    default -> { // Q1
                        h.startDate = LocalDate.of(fyStartYear, 4, 1);
                        h.endDate = LocalDate.of(fyStartYear, 6, 30);
                        h.label = String.format("FY %d-%s Q1 (Apr - Jun %d)", fyStartYear, String.valueOf(fyStartYear + 1).substring(2), fyStartYear);
                    }
                }
            }
            case HALF_YEARLY -> {
                String hf = (filter.getHalfYear() != null && !filter.getHalfYear().isBlank())
                        ? filter.getHalfYear().toUpperCase().trim() : "H1";
                if ("H2".equalsIgnoreCase(hf)) {
                    h.startDate = LocalDate.of(fyStartYear, 10, 1);
                    h.endDate = LocalDate.of(fyStartYear + 1, 3, 31);
                    h.label = String.format("FY %d-%s H2 (Oct %d - Mar %d)", fyStartYear, String.valueOf(fyStartYear + 1).substring(2), fyStartYear, fyStartYear + 1);
                } else {
                    h.startDate = LocalDate.of(fyStartYear, 4, 1);
                    h.endDate = LocalDate.of(fyStartYear, 9, 30);
                    h.label = String.format("FY %d-%s H1 (Apr - Sep %d)", fyStartYear, String.valueOf(fyStartYear + 1).substring(2), fyStartYear);
                }
            }
            case MONTHLY -> {
                int y = filter.getYear() != null ? filter.getYear() : currentYear;
                int m = filter.getMonth() != null ? Math.min(12, Math.max(1, filter.getMonth())) : month;
                YearMonth ym = YearMonth.of(y, m);
                h.startDate = ym.atDay(1);
                h.endDate = ym.atEndOfMonth();
                h.label = String.format("%s %d", ym.getMonth().name(), y);
            }
            case CUSTOM -> {
                h.startDate = filter.getStartDate() != null ? filter.getStartDate() : LocalDate.of(fyStartYear, 4, 1);
                h.endDate = filter.getEndDate() != null ? filter.getEndDate() : LocalDate.now();
                h.label = String.format("Custom (%s to %s)", h.startDate, h.endDate);
            }
            default -> { // FINANCIAL_YEAR
                h.startDate = LocalDate.of(fyStartYear, 4, 1);
                h.endDate = LocalDate.of(fyStartYear + 1, 3, 31);
                h.label = String.format("Financial Year %d-%s", fyStartYear, String.valueOf(fyStartYear + 1).substring(2));
            }
        }

        h.startDateTime = h.startDate.atStartOfDay();
        h.endDateTime = h.endDate.atTime(LocalTime.MAX);
        return h;
    }
}
