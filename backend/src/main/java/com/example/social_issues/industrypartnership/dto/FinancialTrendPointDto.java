package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;

public class FinancialTrendPointDto {

    private String month;
    private BigDecimal committed = BigDecimal.ZERO;
    private BigDecimal disbursed = BigDecimal.ZERO;

    public FinancialTrendPointDto() {}

    public FinancialTrendPointDto(String month, BigDecimal committed, BigDecimal disbursed) {
        this.month = month;
        this.committed = committed;
        this.disbursed = disbursed;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public BigDecimal getCommitted() { return committed; }
    public void setCommitted(BigDecimal committed) { this.committed = committed; }

    public BigDecimal getDisbursed() { return disbursed; }
    public void setDisbursed(BigDecimal disbursed) { this.disbursed = disbursed; }
}
