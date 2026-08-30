package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.DisbursementStatus;
import com.example.social_issues.industrypartnership.model.PilotDisbursement;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DisbursementDto {

    private Long id;
    private Long pilotId;
    private Long milestoneId;
    private Integer trancheNumber;
    private String trancheLabel;
    private String disbursementReference;
    private BigDecimal amount;
    private String amountFormatted;
    private DisbursementStatus status;
    private String statusLabel;
    private LocalDate scheduledDate;
    private LocalDate disbursedDate;
    private String paymentMethod;
    private String utrNumber;
    private String receiptDocUrl;
    private String notes;
    private LocalDateTime createdAt;

    public DisbursementDto() {}

    public static DisbursementDto fromEntity(PilotDisbursement entity) {
        if (entity == null) return null;
        DisbursementDto dto = new DisbursementDto();
        dto.setId(entity.getId());
        dto.setPilotId(entity.getPilot() != null ? entity.getPilot().getId() : null);
        dto.setMilestoneId(entity.getMilestone() != null ? entity.getMilestone().getId() : null);
        dto.setTrancheNumber(entity.getTrancheNumber());
        dto.setTrancheLabel(entity.getTrancheLabel());
        dto.setDisbursementReference(entity.getDisbursementReference());
        dto.setAmount(entity.getAmount() != null ? entity.getAmount() : BigDecimal.ZERO);
        dto.setAmountFormatted(formatCurrency(entity.getAmount()));
        dto.setStatus(entity.getStatus());
        dto.setStatusLabel(formatStatusLabel(entity.getStatus()));
        dto.setScheduledDate(entity.getScheduledDate());
        dto.setDisbursedDate(entity.getDisbursedDate());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setUtrNumber(entity.getUtrNumber());
        dto.setReceiptDocUrl(entity.getReceiptDocUrl());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private static String formatStatusLabel(DisbursementStatus status) {
        if (status == null) return "Scheduled";
        return switch (status) {
            case SCHEDULED -> "Scheduled";
            case PENDING_APPROVAL -> "Pending Approval";
            case DISBURSED -> "Disbursed";
            case HELD -> "On Hold";
        };
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public Long getMilestoneId() { return milestoneId; }
    public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }

    public Integer getTrancheNumber() { return trancheNumber; }
    public void setTrancheNumber(Integer trancheNumber) { this.trancheNumber = trancheNumber; }

    public String getTrancheLabel() { return trancheLabel; }
    public void setTrancheLabel(String trancheLabel) { this.trancheLabel = trancheLabel; }

    public String getDisbursementReference() { return disbursementReference; }
    public void setDisbursementReference(String disbursementReference) { this.disbursementReference = disbursementReference; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getAmountFormatted() { return amountFormatted; }
    public void setAmountFormatted(String amountFormatted) { this.amountFormatted = amountFormatted; }

    public DisbursementStatus getStatus() { return status; }
    public void setStatus(DisbursementStatus status) { this.status = status; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public LocalDate getDisbursedDate() { return disbursedDate; }
    public void setDisbursedDate(LocalDate disbursedDate) { this.disbursedDate = disbursedDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }

    public String getReceiptDocUrl() { return receiptDocUrl; }
    public void setReceiptDocUrl(String receiptDocUrl) { this.receiptDocUrl = receiptDocUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
