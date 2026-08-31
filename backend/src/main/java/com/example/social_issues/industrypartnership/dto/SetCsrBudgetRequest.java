package com.example.social_issues.industrypartnership.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SetCsrBudgetRequest {

    @NotBlank(message = "Financial year is required (e.g. 2026-2027)")
    private String financialYear;

    @NotNull(message = "Mandatory CSR obligation amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount must be positive")
    private BigDecimal mandatoryCsrObligation;

    @NotNull(message = "Earmarked amount for universities/HEIs is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount must be positive")
    private BigDecimal earmarkedForHeis;

    private BigDecimal unspentCarriedForward = BigDecimal.ZERO;
    private Boolean isBoardApproved = true;

    public SetCsrBudgetRequest() {}

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public BigDecimal getMandatoryCsrObligation() { return mandatoryCsrObligation; }
    public void setMandatoryCsrObligation(BigDecimal mandatoryCsrObligation) { this.mandatoryCsrObligation = mandatoryCsrObligation; }

    public BigDecimal getEarmarkedForHeis() { return earmarkedForHeis; }
    public void setEarmarkedForHeis(BigDecimal earmarkedForHeis) { this.earmarkedForHeis = earmarkedForHeis; }

    public BigDecimal getUnspentCarriedForward() { return unspentCarriedForward; }
    public void setUnspentCarriedForward(BigDecimal unspentCarriedForward) { this.unspentCarriedForward = unspentCarriedForward; }

    public Boolean getIsBoardApproved() { return isBoardApproved; }
    public void setIsBoardApproved(Boolean isBoardApproved) { this.isBoardApproved = isBoardApproved; }
}
