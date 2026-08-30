package com.example.social_issues.industrypartnership.dto;

import java.util.ArrayList;
import java.util.List;

public class IndustryOverviewResponse {

    private String companyName;
    private String cinNumber;
    private String csr1RegistrationNumber;
    private String financialYear = "2026-2027";

    private IndustryStatCardsDto statCards;
    private QuickActionsDto quickActions;
    private List<SectorEngagementDto> sectorEngagement = new ArrayList<>();
    private List<IndustryActivityDto> recentActivities = new ArrayList<>();
    private List<FinancialTrendPointDto> capitalDisbursementTrend = new ArrayList<>();

    public IndustryOverviewResponse() {}

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCinNumber() { return cinNumber; }
    public void setCinNumber(String cinNumber) { this.cinNumber = cinNumber; }

    public String getCsr1RegistrationNumber() { return csr1RegistrationNumber; }
    public void setCsr1RegistrationNumber(String csr1RegistrationNumber) { this.csr1RegistrationNumber = csr1RegistrationNumber; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public IndustryStatCardsDto getStatCards() { return statCards; }
    public void setStatCards(IndustryStatCardsDto statCards) { this.statCards = statCards; }

    public QuickActionsDto getQuickActions() { return quickActions; }
    public void setQuickActions(QuickActionsDto quickActions) { this.quickActions = quickActions; }

    public List<SectorEngagementDto> getSectorEngagement() { return sectorEngagement; }
    public void setSectorEngagement(List<SectorEngagementDto> sectorEngagement) { this.sectorEngagement = sectorEngagement; }

    public List<IndustryActivityDto> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<IndustryActivityDto> recentActivities) { this.recentActivities = recentActivities; }

    public List<FinancialTrendPointDto> getCapitalDisbursementTrend() { return capitalDisbursementTrend; }
    public void setCapitalDisbursementTrend(List<FinancialTrendPointDto> capitalDisbursementTrend) { this.capitalDisbursementTrend = capitalDisbursementTrend; }
}
