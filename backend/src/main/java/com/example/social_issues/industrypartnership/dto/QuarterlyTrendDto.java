package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;

public class QuarterlyTrendDto {

    private String quarter;
    private Integer year;
    private BigDecimal committedAmount;
    private String formattedCommittedAmount;
    private BigDecimal disbursedAmount;
    private String formattedDisbursedAmount;
    private Long beneficiariesImpacted;
    private Integer activePilotsCount;
    private Integer testbedDeployments;

    public QuarterlyTrendDto() {}

    public QuarterlyTrendDto(String quarter, Integer year, BigDecimal committedAmount, BigDecimal disbursedAmount, Long beneficiariesImpacted, Integer activePilotsCount, Integer testbedDeployments) {
        this.quarter = quarter;
        this.year = year;
        this.committedAmount = committedAmount != null ? committedAmount : BigDecimal.ZERO;
        this.disbursedAmount = disbursedAmount != null ? disbursedAmount : BigDecimal.ZERO;
        this.beneficiariesImpacted = beneficiariesImpacted != null ? beneficiariesImpacted : 0L;
        this.activePilotsCount = activePilotsCount != null ? activePilotsCount : 0;
        this.testbedDeployments = testbedDeployments != null ? testbedDeployments : 0;
    }

    public String getQuarter() { return quarter; }
    public void setQuarter(String quarter) { this.quarter = quarter; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public BigDecimal getCommittedAmount() { return committedAmount; }
    public void setCommittedAmount(BigDecimal committedAmount) { this.committedAmount = committedAmount; }

    public String getFormattedCommittedAmount() { return formattedCommittedAmount; }
    public void setFormattedCommittedAmount(String formattedCommittedAmount) { this.formattedCommittedAmount = formattedCommittedAmount; }

    public BigDecimal getDisbursedAmount() { return disbursedAmount; }
    public void setDisbursedAmount(BigDecimal disbursedAmount) { this.disbursedAmount = disbursedAmount; }

    public String getFormattedDisbursedAmount() { return formattedDisbursedAmount; }
    public void setFormattedDisbursedAmount(String formattedDisbursedAmount) { this.formattedDisbursedAmount = formattedDisbursedAmount; }

    public Long getBeneficiariesImpacted() { return beneficiariesImpacted; }
    public void setBeneficiariesImpacted(Long beneficiariesImpacted) { this.beneficiariesImpacted = beneficiariesImpacted; }

    public Integer getActivePilotsCount() { return activePilotsCount; }
    public void setActivePilotsCount(Integer activePilotsCount) { this.activePilotsCount = activePilotsCount; }

    public Integer getTestbedDeployments() { return testbedDeployments; }
    public void setTestbedDeployments(Integer testbedDeployments) { this.testbedDeployments = testbedDeployments; }
}
