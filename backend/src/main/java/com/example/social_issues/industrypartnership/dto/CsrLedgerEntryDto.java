package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.PilotDisbursement;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CsrLedgerEntryDto {

    private Long id;
    private Long disbursementId;
    private Long pilotId;
    private String pilotTitle;
    private String universityName;
    private String targetDistrict;
    private String financialYear;

    private String trancheLabel;
    private String disbursementReference;
    private String csrProjectCode;
    private String scheduleVIICategory;
    private String scheduleVIIClause;

    private BigDecimal amount;
    private String amountFormatted;

    private String status;
    private LocalDate transactionDate;
    private String paymentMethod;
    private String utrNumber;
    private String receiptDocUrl;
    private String notes;

    private Boolean hasUtilizationCertificate;
    private String ucNumber;

    public CsrLedgerEntryDto() {}

    public static CsrLedgerEntryDto fromDisbursement(PilotDisbursement d, String financialYear, Boolean hasUc, String ucNum) {
        CsrLedgerEntryDto dto = new CsrLedgerEntryDto();
        dto.setId(d.getId());
        dto.setDisbursementId(d.getId());

        if (d.getPilot() != null) {
            dto.setPilotId(d.getPilot().getId());
            dto.setPilotTitle(d.getPilot().getTitle());
            dto.setUniversityName(d.getPilot().getUniversityName());
            dto.setTargetDistrict(d.getPilot().getTargetDistrict());
            dto.setCsrProjectCode("CSR-PLT-" + d.getPilot().getId());
            dto.setScheduleVIICategory("Item (ix) - Public Funded Universities & Incubators");
            dto.setScheduleVIIClause("Section 135(5) Schedule VII Item (ix)");
        } else {
            dto.setPilotTitle("Independent CSR Grant");
            dto.setUniversityName("Academic Partner");
            dto.setScheduleVIICategory("Item (ix)");
            dto.setScheduleVIIClause("Section 135(5) Schedule VII Item (ix)");
        }

        dto.setFinancialYear(financialYear != null ? financialYear : "2026-2027");
        dto.setTrancheLabel(d.getTrancheLabel());
        dto.setDisbursementReference(d.getDisbursementReference());

        dto.setAmount(d.getAmount());
        dto.setAmountFormatted(formatCurrency(d.getAmount()));
        dto.setStatus(d.getStatus().name());

        dto.setTransactionDate(d.getDisbursedDate() != null ? d.getDisbursedDate() : d.getScheduledDate());
        dto.setPaymentMethod(d.getPaymentMethod() != null ? d.getPaymentMethod() : "NEFT_RTGS");
        dto.setUtrNumber(d.getUtrNumber());
        dto.setReceiptDocUrl(d.getReceiptDocUrl());
        dto.setNotes(d.getNotes());

        dto.setHasUtilizationCertificate(hasUc != null ? hasUc : false);
        dto.setUcNumber(ucNum);

        return dto;
    }

    private static String formatCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return "₹0";
        double val = amount.doubleValue();
        if (val >= 10000000) {
            return String.format("₹%.2f Cr", val / 10000000);
        } else if (val >= 100000) {
            return String.format("₹%.1f Lakhs", val / 100000);
        } else if (val >= 1000) {
            return String.format("₹%.1f K", val / 1000);
        }
        return "₹" + amount.toPlainString();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDisbursementId() { return disbursementId; }
    public void setDisbursementId(Long disbursementId) { this.disbursementId = disbursementId; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public String getPilotTitle() { return pilotTitle; }
    public void setPilotTitle(String pilotTitle) { this.pilotTitle = pilotTitle; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getTargetDistrict() { return targetDistrict; }
    public void setTargetDistrict(String targetDistrict) { this.targetDistrict = targetDistrict; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getTrancheLabel() { return trancheLabel; }
    public void setTrancheLabel(String trancheLabel) { this.trancheLabel = trancheLabel; }

    public String getDisbursementReference() { return disbursementReference; }
    public void setDisbursementReference(String disbursementReference) { this.disbursementReference = disbursementReference; }

    public String getCsrProjectCode() { return csrProjectCode; }
    public void setCsrProjectCode(String csrProjectCode) { this.csrProjectCode = csrProjectCode; }

    public String getScheduleVIICategory() { return scheduleVIICategory; }
    public void setScheduleVIICategory(String scheduleVIICategory) { this.scheduleVIICategory = scheduleVIICategory; }

    public String getScheduleVIIClause() { return scheduleVIIClause; }
    public void setScheduleVIIClause(String scheduleVIIClause) { this.scheduleVIIClause = scheduleVIIClause; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getAmountFormatted() { return amountFormatted; }
    public void setAmountFormatted(String amountFormatted) { this.amountFormatted = amountFormatted; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }

    public String getReceiptDocUrl() { return receiptDocUrl; }
    public void setReceiptDocUrl(String receiptDocUrl) { this.receiptDocUrl = receiptDocUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getHasUtilizationCertificate() { return hasUtilizationCertificate; }
    public void setHasUtilizationCertificate(Boolean hasUtilizationCertificate) { this.hasUtilizationCertificate = hasUtilizationCertificate; }

    public String getUcNumber() { return ucNumber; }
    public void setUcNumber(String ucNumber) { this.ucNumber = ucNumber; }
}
