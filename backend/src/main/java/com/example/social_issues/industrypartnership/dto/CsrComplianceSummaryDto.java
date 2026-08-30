package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;

public class CsrComplianceSummaryDto {

    private String csr1Status = "VALIDATED";
    private BigDecimal annualBudget = BigDecimal.ZERO;
    private double commitmentPercentage = 0.0;
    private String mcaFilingStatus = "ON_TRACK";
    private int complianceScore = 95;

    public CsrComplianceSummaryDto() {}

    public String getCsr1Status() { return csr1Status; }
    public void setCsr1Status(String csr1Status) { this.csr1Status = csr1Status; }

    public BigDecimal getAnnualBudget() { return annualBudget; }
    public void setAnnualBudget(BigDecimal annualBudget) { this.annualBudget = annualBudget; }

    public double getCommitmentPercentage() { return commitmentPercentage; }
    public void setCommitmentPercentage(double commitmentPercentage) { this.commitmentPercentage = commitmentPercentage; }

    public String getMcaFilingStatus() { return mcaFilingStatus; }
    public void setMcaFilingStatus(String mcaFilingStatus) { this.mcaFilingStatus = mcaFilingStatus; }

    public int getComplianceScore() { return complianceScore; }
    public void setComplianceScore(int complianceScore) { this.complianceScore = complianceScore; }
}
