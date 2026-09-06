package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;
import java.util.List;

public class CsrBudgetSummaryDto {

    private String financialYear;
    private String corporateName;
    private String cinNumber;
    private String gstin;

    private BigDecimal mandatoryCsrObligation;
    private String mandatoryCsrObligationFormatted;

    private BigDecimal earmarkedForHeis;
    private String earmarkedForHeisFormatted;

    private BigDecimal totalCommittedAmount;
    private String totalCommittedFormatted;

    private BigDecimal totalDisbursedAmount;
    private String totalDisbursedFormatted;

    private BigDecimal verifiedUtilizedAmount;
    private String verifiedUtilizedFormatted;

    private BigDecimal unspentBalanceAmount;
    private String unspentBalanceFormatted;

    private Double obligationUtilizationPercentage;
    private Double earmarkedUtilizationPercentage;

    private Integer totalActivePilotsCount;
    private Integer totalAuditedUcsCount;

    private List<ScheduleVIICategorySummaryDto> categoryBreakdown;

    public static class ScheduleVIICategorySummaryDto {
        private String categoryCode;
        private String categoryName;
        private Long projectsCount;
        private BigDecimal committedAmount;
        private String committedFormatted;
        private BigDecimal disbursedAmount;
        private String disbursedFormatted;
        private Double sharePercentage;

        public ScheduleVIICategorySummaryDto() {}

        public ScheduleVIICategorySummaryDto(
                String categoryCode, String categoryName, Long projectsCount,
                BigDecimal committedAmount, String committedFormatted,
                BigDecimal disbursedAmount, String disbursedFormatted,
                Double sharePercentage) {
            this.categoryCode = categoryCode;
            this.categoryName = categoryName;
            this.projectsCount = projectsCount;
            this.committedAmount = committedAmount;
            this.committedFormatted = committedFormatted;
            this.disbursedAmount = disbursedAmount;
            this.disbursedFormatted = disbursedFormatted;
            this.sharePercentage = sharePercentage;
        }

        public String getCategoryCode() { return categoryCode; }
        public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public Long getProjectsCount() { return projectsCount; }
        public void setProjectsCount(Long projectsCount) { this.projectsCount = projectsCount; }

        public BigDecimal getCommittedAmount() { return committedAmount; }
        public void setCommittedAmount(BigDecimal committedAmount) { this.committedAmount = committedAmount; }

        public String getCommittedFormatted() { return committedFormatted; }
        public void setCommittedFormatted(String committedFormatted) { this.committedFormatted = committedFormatted; }

        public BigDecimal getDisbursedAmount() { return disbursedAmount; }
        public void setDisbursedAmount(BigDecimal disbursedAmount) { this.disbursedAmount = disbursedAmount; }

        public String getDisbursedFormatted() { return disbursedFormatted; }
        public void setDisbursedFormatted(String disbursedFormatted) { this.disbursedFormatted = disbursedFormatted; }

        public Double getSharePercentage() { return sharePercentage; }
        public void setSharePercentage(Double sharePercentage) { this.sharePercentage = sharePercentage; }
    }

    public CsrBudgetSummaryDto() {}

    // Getters and Setters
    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getCorporateName() { return corporateName; }
    public void setCorporateName(String corporateName) { this.corporateName = corporateName; }

    public String getCinNumber() { return cinNumber; }
    public void setCinNumber(String cinNumber) { this.cinNumber = cinNumber; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public BigDecimal getMandatoryCsrObligation() { return mandatoryCsrObligation; }
    public void setMandatoryCsrObligation(BigDecimal mandatoryCsrObligation) { this.mandatoryCsrObligation = mandatoryCsrObligation; }

    public String getMandatoryCsrObligationFormatted() { return mandatoryCsrObligationFormatted; }
    public void setMandatoryCsrObligationFormatted(String mandatoryCsrObligationFormatted) { this.mandatoryCsrObligationFormatted = mandatoryCsrObligationFormatted; }

    public BigDecimal getEarmarkedForHeis() { return earmarkedForHeis; }
    public void setEarmarkedForHeis(BigDecimal earmarkedForHeis) { this.earmarkedForHeis = earmarkedForHeis; }

    public String getEarmarkedForHeisFormatted() { return earmarkedForHeisFormatted; }
    public void setEarmarkedForHeisFormatted(String earmarkedForHeisFormatted) { this.earmarkedForHeisFormatted = earmarkedForHeisFormatted; }

    public BigDecimal getTotalCommittedAmount() { return totalCommittedAmount; }
    public void setTotalCommittedAmount(BigDecimal totalCommittedAmount) { this.totalCommittedAmount = totalCommittedAmount; }

    public String getTotalCommittedFormatted() { return totalCommittedFormatted; }
    public void setTotalCommittedFormatted(String totalCommittedFormatted) { this.totalCommittedFormatted = totalCommittedFormatted; }

    public BigDecimal getTotalDisbursedAmount() { return totalDisbursedAmount; }
    public void setTotalDisbursedAmount(BigDecimal totalDisbursedAmount) { this.totalDisbursedAmount = totalDisbursedAmount; }

    public String getTotalDisbursedFormatted() { return totalDisbursedFormatted; }
    public void setTotalDisbursedFormatted(String totalDisbursedFormatted) { this.totalDisbursedFormatted = totalDisbursedFormatted; }

    public BigDecimal getVerifiedUtilizedAmount() { return verifiedUtilizedAmount; }
    public void setVerifiedUtilizedAmount(BigDecimal verifiedUtilizedAmount) { this.verifiedUtilizedAmount = verifiedUtilizedAmount; }

    public String getVerifiedUtilizedFormatted() { return verifiedUtilizedFormatted; }
    public void setVerifiedUtilizedFormatted(String verifiedUtilizedFormatted) { this.verifiedUtilizedFormatted = verifiedUtilizedFormatted; }

    public BigDecimal getUnspentBalanceAmount() { return unspentBalanceAmount; }
    public void setUnspentBalanceAmount(BigDecimal unspentBalanceAmount) { this.unspentBalanceAmount = unspentBalanceAmount; }

    public String getUnspentBalanceFormatted() { return unspentBalanceFormatted; }
    public void setUnspentBalanceFormatted(String unspentBalanceFormatted) { this.unspentBalanceFormatted = unspentBalanceFormatted; }

    public Double getObligationUtilizationPercentage() { return obligationUtilizationPercentage; }
    public void setObligationUtilizationPercentage(Double obligationUtilizationPercentage) { this.obligationUtilizationPercentage = obligationUtilizationPercentage; }

    public Double getEarmarkedUtilizationPercentage() { return earmarkedUtilizationPercentage; }
    public void setEarmarkedUtilizationPercentage(Double earmarkedUtilizationPercentage) { this.earmarkedUtilizationPercentage = earmarkedUtilizationPercentage; }

    public Integer getTotalActivePilotsCount() { return totalActivePilotsCount; }
    public void setTotalActivePilotsCount(Integer totalActivePilotsCount) { this.totalActivePilotsCount = totalActivePilotsCount; }

    public Integer getTotalAuditedUcsCount() { return totalAuditedUcsCount; }
    public void setTotalAuditedUcsCount(Integer totalAuditedUcsCount) { this.totalAuditedUcsCount = totalAuditedUcsCount; }

    public List<ScheduleVIICategorySummaryDto> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<ScheduleVIICategorySummaryDto> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }
}
