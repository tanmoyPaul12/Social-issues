package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.CsrCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CommitFundingRequest {

    @NotNull(message = "Grant commitment amount is required")
    @DecimalMin(value = "1000.00", message = "Minimum grant commitment is ₹1,000")
    private BigDecimal grantAmount;

    private CsrCategory csrCategory = CsrCategory.EDUCATION_SKILLING;
    private String csrScheduleViiHead = "Schedule VII Item (ix) - Public Funded Universities & Incubators";
    private String corporateMentorName;
    private String corporateMentorDesignation;
    private String messageNotes;
    private String financialYear = "2026-2027";

    public CommitFundingRequest() {}

    public BigDecimal getGrantAmount() { return grantAmount; }
    public void setGrantAmount(BigDecimal grantAmount) { this.grantAmount = grantAmount; }

    public CsrCategory getCsrCategory() { return csrCategory; }
    public void setCsrCategory(CsrCategory csrCategory) { this.csrCategory = csrCategory; }

    public String getCsrScheduleViiHead() { return csrScheduleViiHead; }
    public void setCsrScheduleViiHead(String csrScheduleViiHead) { this.csrScheduleViiHead = csrScheduleViiHead; }

    public String getCorporateMentorName() { return corporateMentorName; }
    public void setCorporateMentorName(String corporateMentorName) { this.corporateMentorName = corporateMentorName; }

    public String getCorporateMentorDesignation() { return corporateMentorDesignation; }
    public void setCorporateMentorDesignation(String corporateMentorDesignation) { this.corporateMentorDesignation = corporateMentorDesignation; }

    public String getMessageNotes() { return messageNotes; }
    public void setMessageNotes(String messageNotes) { this.messageNotes = messageNotes; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }
}
