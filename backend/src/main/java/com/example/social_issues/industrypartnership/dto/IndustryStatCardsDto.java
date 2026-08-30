package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;

public class IndustryStatCardsDto {

    private BigDecimal csrCapitalCommitted = BigDecimal.ZERO;
    private BigDecimal csrCapitalDisbursed = BigDecimal.ZERO;
    private String csrCapitalCommittedFormatted;
    private String csrCapitalDisbursedFormatted;

    private int activeCoFundedPilotsCount = 0;
    private int pendingMilestonesCount = 0;

    private int testbedsSponsoredCount = 0;
    private int districtsCoveredCount = 0;
    private long estimatedBeneficiariesCount = 0L;

    private CsrComplianceSummaryDto csrCompliance;

    public IndustryStatCardsDto() {}

    public BigDecimal getCsrCapitalCommitted() { return csrCapitalCommitted; }
    public void setCsrCapitalCommitted(BigDecimal csrCapitalCommitted) { this.csrCapitalCommitted = csrCapitalCommitted; }

    public BigDecimal getCsrCapitalDisbursed() { return csrCapitalDisbursed; }
    public void setCsrCapitalDisbursed(BigDecimal csrCapitalDisbursed) { this.csrCapitalDisbursed = csrCapitalDisbursed; }

    public String getCsrCapitalCommittedFormatted() { return csrCapitalCommittedFormatted; }
    public void setCsrCapitalCommittedFormatted(String csrCapitalCommittedFormatted) { this.csrCapitalCommittedFormatted = csrCapitalCommittedFormatted; }

    public String getCsrCapitalDisbursedFormatted() { return csrCapitalDisbursedFormatted; }
    public void setCsrCapitalDisbursedFormatted(String csrCapitalDisbursedFormatted) { this.csrCapitalDisbursedFormatted = csrCapitalDisbursedFormatted; }

    public int getActiveCoFundedPilotsCount() { return activeCoFundedPilotsCount; }
    public void setActiveCoFundedPilotsCount(int activeCoFundedPilotsCount) { this.activeCoFundedPilotsCount = activeCoFundedPilotsCount; }

    public int getPendingMilestonesCount() { return pendingMilestonesCount; }
    public void setPendingMilestonesCount(int pendingMilestonesCount) { this.pendingMilestonesCount = pendingMilestonesCount; }

    public int getTestbedsSponsoredCount() { return testbedsSponsoredCount; }
    public void setTestbedsSponsoredCount(int testbedsSponsoredCount) { this.testbedsSponsoredCount = testbedsSponsoredCount; }

    public int getDistrictsCoveredCount() { return districtsCoveredCount; }
    public void setDistrictsCoveredCount(int districtsCoveredCount) { this.districtsCoveredCount = districtsCoveredCount; }

    public long getEstimatedBeneficiariesCount() { return estimatedBeneficiariesCount; }
    public void setEstimatedBeneficiariesCount(long estimatedBeneficiariesCount) { this.estimatedBeneficiariesCount = estimatedBeneficiariesCount; }

    public CsrComplianceSummaryDto getCsrCompliance() { return csrCompliance; }
    public void setCsrCompliance(CsrComplianceSummaryDto csrCompliance) { this.csrCompliance = csrCompliance; }
}
