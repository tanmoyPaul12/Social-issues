package com.example.social_issues.industrypartnership.dto;

public class TestbedDistrictSummaryDto {

    private String district;
    private Long activeTestbedsCount;
    private Long totalBeneficiaries;
    private Long liveDeploymentsCount;

    public TestbedDistrictSummaryDto() {}

    public TestbedDistrictSummaryDto(String district, Long activeTestbedsCount, Long totalBeneficiaries, Long liveDeploymentsCount) {
        this.district = district;
        this.activeTestbedsCount = activeTestbedsCount != null ? activeTestbedsCount : 0L;
        this.totalBeneficiaries = totalBeneficiaries != null ? totalBeneficiaries : 0L;
        this.liveDeploymentsCount = liveDeploymentsCount != null ? liveDeploymentsCount : 0L;
    }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public Long getActiveTestbedsCount() { return activeTestbedsCount; }
    public void setActiveTestbedsCount(Long activeTestbedsCount) { this.activeTestbedsCount = activeTestbedsCount; }

    public Long getTotalBeneficiaries() { return totalBeneficiaries; }
    public void setTotalBeneficiaries(Long totalBeneficiaries) { this.totalBeneficiaries = totalBeneficiaries; }

    public Long getLiveDeploymentsCount() { return liveDeploymentsCount; }
    public void setLiveDeploymentsCount(Long liveDeploymentsCount) { this.liveDeploymentsCount = liveDeploymentsCount; }
}
