package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;

public class ImpactSummaryDto {

    private Long totalBeneficiaries;
    private Integer districtsCovered;
    private Integer pilotsCompleted;
    private Integer activePilotsCount;
    private BigDecimal totalCsrSpend;
    private String formattedCsrSpend;
    private BigDecimal totalGrantCommitted;
    private String formattedGrantCommitted;
    private Integer patentsGenerated;
    private Integer jobsCreated;
    private Integer activeTestbedCount;
    private Integer coDevelopmentAgreementsCount;
    private Double avgRoiPercentage;

    public ImpactSummaryDto() {}

    public Long getTotalBeneficiaries() { return totalBeneficiaries; }
    public void setTotalBeneficiaries(Long totalBeneficiaries) { this.totalBeneficiaries = totalBeneficiaries; }

    public Integer getDistrictsCovered() { return districtsCovered; }
    public void setDistrictsCovered(Integer districtsCovered) { this.districtsCovered = districtsCovered; }

    public Integer getPilotsCompleted() { return pilotsCompleted; }
    public void setPilotsCompleted(Integer pilotsCompleted) { this.pilotsCompleted = pilotsCompleted; }

    public Integer getActivePilotsCount() { return activePilotsCount; }
    public void setActivePilotsCount(Integer activePilotsCount) { this.activePilotsCount = activePilotsCount; }

    public BigDecimal getTotalCsrSpend() { return totalCsrSpend; }
    public void setTotalCsrSpend(BigDecimal totalCsrSpend) { this.totalCsrSpend = totalCsrSpend; }

    public String getFormattedCsrSpend() { return formattedCsrSpend; }
    public void setFormattedCsrSpend(String formattedCsrSpend) { this.formattedCsrSpend = formattedCsrSpend; }

    public BigDecimal getTotalGrantCommitted() { return totalGrantCommitted; }
    public void setTotalGrantCommitted(BigDecimal totalGrantCommitted) { this.totalGrantCommitted = totalGrantCommitted; }

    public String getFormattedGrantCommitted() { return formattedGrantCommitted; }
    public void setFormattedGrantCommitted(String formattedGrantCommitted) { this.formattedGrantCommitted = formattedGrantCommitted; }

    public Integer getPatentsGenerated() { return patentsGenerated; }
    public void setPatentsGenerated(Integer patentsGenerated) { this.patentsGenerated = patentsGenerated; }

    public Integer getJobsCreated() { return jobsCreated; }
    public void setJobsCreated(Integer jobsCreated) { this.jobsCreated = jobsCreated; }

    public Integer getActiveTestbedCount() { return activeTestbedCount; }
    public void setActiveTestbedCount(Integer activeTestbedCount) { this.activeTestbedCount = activeTestbedCount; }

    public Integer getCoDevelopmentAgreementsCount() { return coDevelopmentAgreementsCount; }
    public void setCoDevelopmentAgreementsCount(Integer coDevelopmentAgreementsCount) { this.coDevelopmentAgreementsCount = coDevelopmentAgreementsCount; }

    public Double getAvgRoiPercentage() { return avgRoiPercentage; }
    public void setAvgRoiPercentage(Double avgRoiPercentage) { this.avgRoiPercentage = avgRoiPercentage; }
}
