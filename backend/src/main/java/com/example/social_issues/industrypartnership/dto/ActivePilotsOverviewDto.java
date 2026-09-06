package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;

public class ActivePilotsOverviewDto {

    private long totalPilotsCount;
    private long activePilotsCount;
    private long pendingMilestonesCount;
    private long atRiskPilotsCount;
    private long completedPilotsCount;

    private BigDecimal totalCommittedAmount = BigDecimal.ZERO;
    private String totalCommittedFormatted = "₹0";
    private BigDecimal totalDisbursedAmount = BigDecimal.ZERO;
    private String totalDisbursedFormatted = "₹0";
    private double overallDisbursedPercentage = 0.0;

    public ActivePilotsOverviewDto() {}

    public long getTotalPilotsCount() { return totalPilotsCount; }
    public void setTotalPilotsCount(long totalPilotsCount) { this.totalPilotsCount = totalPilotsCount; }

    public long getActivePilotsCount() { return activePilotsCount; }
    public void setActivePilotsCount(long activePilotsCount) { this.activePilotsCount = activePilotsCount; }

    public long getPendingMilestonesCount() { return pendingMilestonesCount; }
    public void setPendingMilestonesCount(long pendingMilestonesCount) { this.pendingMilestonesCount = pendingMilestonesCount; }

    public long getAtRiskPilotsCount() { return atRiskPilotsCount; }
    public void setAtRiskPilotsCount(long atRiskPilotsCount) { this.atRiskPilotsCount = atRiskPilotsCount; }

    public long getCompletedPilotsCount() { return completedPilotsCount; }
    public void setCompletedPilotsCount(long completedPilotsCount) { this.completedPilotsCount = completedPilotsCount; }

    public BigDecimal getTotalCommittedAmount() { return totalCommittedAmount; }
    public void setTotalCommittedAmount(BigDecimal totalCommittedAmount) { this.totalCommittedAmount = totalCommittedAmount; }

    public String getTotalCommittedFormatted() { return totalCommittedFormatted; }
    public void setTotalCommittedFormatted(String totalCommittedFormatted) { this.totalCommittedFormatted = totalCommittedFormatted; }

    public BigDecimal getTotalDisbursedAmount() { return totalDisbursedAmount; }
    public void setTotalDisbursedAmount(BigDecimal totalDisbursedAmount) { this.totalDisbursedAmount = totalDisbursedAmount; }

    public String getTotalDisbursedFormatted() { return totalDisbursedFormatted; }
    public void setTotalDisbursedFormatted(String totalDisbursedFormatted) { this.totalDisbursedFormatted = totalDisbursedFormatted; }

    public double getOverallDisbursedPercentage() { return overallDisbursedPercentage; }
    public void setOverallDisbursedPercentage(double overallDisbursedPercentage) { this.overallDisbursedPercentage = overallDisbursedPercentage; }
}
