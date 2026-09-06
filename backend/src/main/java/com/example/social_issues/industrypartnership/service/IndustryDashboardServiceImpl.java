package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.industrypartnership.dto.*;

import com.example.social_issues.industrypartnership.model.IndustryActivityLog;
import com.example.social_issues.industrypartnership.repository.CoFundedPilotRepository;
import com.example.social_issues.industrypartnership.repository.CsrCommitmentRepository;
import com.example.social_issues.industrypartnership.repository.IndustryActivityLogRepository;
import com.example.social_issues.industrypartnership.repository.TestbedSponsorshipRepository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class IndustryDashboardServiceImpl implements IndustryDashboardService {

    

    private final IndustryProfileRepository industryProfileRepository;
    private final CsrCommitmentRepository csrCommitmentRepository;
    private final CoFundedPilotRepository coFundedPilotRepository;
    private final TestbedSponsorshipRepository testbedSponsorshipRepository;
    private final IndustryActivityLogRepository activityLogRepository;

    public IndustryDashboardServiceImpl(
            IndustryProfileRepository industryProfileRepository,
            CsrCommitmentRepository csrCommitmentRepository,
            CoFundedPilotRepository coFundedPilotRepository,
            TestbedSponsorshipRepository testbedSponsorshipRepository,
            IndustryActivityLogRepository activityLogRepository) {
        this.industryProfileRepository = industryProfileRepository;
        this.csrCommitmentRepository = csrCommitmentRepository;
        this.coFundedPilotRepository = coFundedPilotRepository;
        this.testbedSponsorshipRepository = testbedSponsorshipRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public IndustryOverviewResponse getOverview(Long userId, String financialYear) {
        IndustryProfile profile = industryProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Industry profile not found for user ID: " + userId));

        Long profileId = profile.getId();
        String fy = (financialYear != null && !financialYear.isBlank()) ? financialYear : "2026-2027";

        IndustryOverviewResponse response = new IndustryOverviewResponse();
        response.setCompanyName(profile.getCompanyName());
        response.setCinNumber(profile.getCinNumber() != null ? profile.getCinNumber() : "L27100MH1907PLC000260");
        response.setCsr1RegistrationNumber(profile.getCsrNumber() != null ? profile.getCsrNumber() : "CSR00018492");
        response.setFinancialYear(fy);

        // 1. Calculate Stat Cards
        IndustryStatCardsDto statCards = buildStatCards(profileId);
        response.setStatCards(statCards);

        // 2. Quick Actions
        int pendingApprovals = statCards.getPendingMilestonesCount();
        int unreadAlerts = activityLogRepository.countByIndustryProfileIdAndIsReadFalse(profileId);
        response.setQuickActions(new QuickActionsDto(pendingApprovals, 4, unreadAlerts));

        // 3. Sector Engagement Breakdown
        List<SectorEngagementDto> sectorBreakdown = buildSectorEngagement(profileId, statCards.getCsrCapitalCommitted());
        response.setSectorEngagement(sectorBreakdown);

        // 4. Recent Activities Feed
        List<IndustryActivityDto> recentActivities = buildRecentActivities(profileId);
        response.setRecentActivities(recentActivities);

        // 5. Capital Flow Trend
        response.setCapitalDisbursementTrend(buildFinancialTrend(statCards.getCsrCapitalCommitted(), statCards.getCsrCapitalDisbursed()));

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IndustryActivityDto> getActivities(Long userId, int page, int size, String eventType) {
        IndustryProfile profile = industryProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Industry profile not found for user ID: " + userId));

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(size > 0 ? size : 10, 50));
        return activityLogRepository.findByIndustryProfileIdOrderByCreatedAtDesc(profile.getId(), pageable)
                .map(IndustryActivityDto::fromEntity);
    }

    @Override
    @Transactional
    public void markActivityAsRead(Long userId, Long activityId) {
        IndustryProfile profile = industryProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Industry profile not found for user ID: " + userId));

        activityLogRepository.findById(activityId).ifPresent(activity -> {
            if (activity.getIndustryProfile().getId().equals(profile.getId())) {
                activity.setIsRead(true);
                activityLogRepository.save(activity);
            }
        });
    }

    private IndustryStatCardsDto buildStatCards(Long profileId) {
        IndustryStatCardsDto stats = new IndustryStatCardsDto();

        BigDecimal committed = csrCommitmentRepository.sumTotalCommittedAmountByProfileId(profileId);
        BigDecimal disbursed = csrCommitmentRepository.sumTotalDisbursedAmountByProfileId(profileId);

        if (committed == null) {
            committed = BigDecimal.ZERO;
        }
        if (disbursed == null) {
            disbursed = BigDecimal.ZERO;
        }

        stats.setCsrCapitalCommitted(committed);
        stats.setCsrCapitalDisbursed(disbursed);
        stats.setCsrCapitalCommittedFormatted(formatIndianCurrency(committed));
        stats.setCsrCapitalDisbursedFormatted(formatIndianCurrency(disbursed));

        int activePilots = coFundedPilotRepository.countActivePilotsByProfileId(profileId);
        int pendingMilestones = coFundedPilotRepository.countPendingMilestonesByProfileId(profileId);
        stats.setActiveCoFundedPilotsCount(activePilots);
        stats.setPendingMilestonesCount(pendingMilestones);

        int testbeds = testbedSponsorshipRepository.countByIndustryProfileId(profileId);
        int districts = testbedSponsorshipRepository.countDistinctDistrictsByProfileId(profileId);
        long beneficiaries = testbedSponsorshipRepository.sumBeneficiariesByProfileId(profileId);

        stats.setTestbedsSponsoredCount(testbeds);
        stats.setDistrictsCoveredCount(districts);
        stats.setEstimatedBeneficiariesCount(beneficiaries);

        // CSR Compliance
        CsrComplianceSummaryDto compliance = new CsrComplianceSummaryDto();
        compliance.setCsr1Status("VALIDATED");
        compliance.setAnnualBudget(BigDecimal.ZERO);
        compliance.setCommitmentPercentage(0.0);
        compliance.setMcaFilingStatus("ON_TRACK");
        compliance.setComplianceScore(100);
        stats.setCsrCompliance(compliance);

        return stats;
    }

    private List<SectorEngagementDto> buildSectorEngagement(Long profileId, BigDecimal totalCommitted) {
        List<SectorEngagementDto> breakdown = csrCommitmentRepository.getSectorWiseBreakdownByProfileId(profileId);

        if (breakdown == null) {
            breakdown = new ArrayList<>();
        }

        BigDecimal total = (totalCommitted != null && totalCommitted.compareTo(BigDecimal.ZERO) > 0) ? totalCommitted : BigDecimal.ZERO;
        if (total.compareTo(BigDecimal.ZERO) > 0) {
            for (SectorEngagementDto item : breakdown) {
                double pct = item.getCommittedAmount().divide(total, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
                item.setPercentage(Math.round(pct * 10.0) / 10.0);
            }
        }
        return breakdown;
    }

    private List<IndustryActivityDto> buildRecentActivities(Long profileId) {
        List<IndustryActivityLog> logs = activityLogRepository.findTop10ByIndustryProfileIdOrderByCreatedAtDesc(profileId);
        List<IndustryActivityDto> dtos = new ArrayList<>();

        if (logs != null && !logs.isEmpty()) {
            for (IndustryActivityLog logItem : logs) {
                dtos.add(IndustryActivityDto.fromEntity(logItem));
            }
        }
        return dtos;
    }

    private List<FinancialTrendPointDto> buildFinancialTrend(BigDecimal committed, BigDecimal disbursed) {
        return new ArrayList<>();
    }

    private String formatIndianCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return "₹0";
        double val = amount.doubleValue();
        if (val >= 10000000.0) { // 1 Crore
            return String.format(Locale.ENGLISH, "₹%.2f Cr", val / 10000000.0);
        } else if (val >= 100000.0) { // 1 Lakh
            return String.format(Locale.ENGLISH, "₹%.1f Lakhs", val / 100000.0);
        } else {
            NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.of("en", "IN"));
            return formatter.format(val);
        }
    }
}
