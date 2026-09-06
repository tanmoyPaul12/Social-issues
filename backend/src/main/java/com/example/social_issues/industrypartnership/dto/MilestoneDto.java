package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.MilestoneStatus;
import com.example.social_issues.industrypartnership.model.PilotMilestone;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MilestoneDto {

    private Long id;
    private Long pilotId;
    private Integer milestoneNumber;
    private String title;
    private String deliverableSummary;
    private LocalDate targetDate;
    private LocalDate completedDate;
    private MilestoneStatus status;
    private String statusLabel;
    private BigDecimal trancheAmount;
    private String trancheAmountFormatted;
    private Integer completionPercentage;
    private String evidenceDocUrl;
    private String submissionRemarks;
    private String reviewRemarks;
    private LocalDateTime reviewedAt;

    public MilestoneDto() {}

    public static MilestoneDto fromEntity(PilotMilestone entity) {
        if (entity == null) return null;
        MilestoneDto dto = new MilestoneDto();
        dto.setId(entity.getId());
        dto.setPilotId(entity.getPilot() != null ? entity.getPilot().getId() : null);
        dto.setMilestoneNumber(entity.getMilestoneNumber());
        dto.setTitle(entity.getTitle());
        dto.setDeliverableSummary(entity.getDeliverableSummary());
        dto.setTargetDate(entity.getTargetDate());
        dto.setCompletedDate(entity.getCompletedDate());
        dto.setStatus(entity.getStatus());
        dto.setStatusLabel(formatStatusLabel(entity.getStatus()));
        dto.setTrancheAmount(entity.getTrancheAmount() != null ? entity.getTrancheAmount() : BigDecimal.ZERO);
        dto.setTrancheAmountFormatted(formatCurrency(entity.getTrancheAmount()));
        dto.setCompletionPercentage(entity.getCompletionPercentage() != null ? entity.getCompletionPercentage() : 0);
        dto.setEvidenceDocUrl(entity.getEvidenceDocUrl());
        dto.setSubmissionRemarks(entity.getSubmissionRemarks());
        dto.setReviewRemarks(entity.getReviewRemarks());
        dto.setReviewedAt(entity.getReviewedAt());
        return dto;
    }

    private static String formatStatusLabel(MilestoneStatus status) {
        if (status == null) return "Upcoming";
        return switch (status) {
            case UPCOMING -> "Upcoming";
            case IN_PROGRESS -> "In Progress";
            case SUBMITTED_FOR_REVIEW -> "Pending Review";
            case APPROVED -> "Approved";
            case REVISION_REQUESTED -> "Revision Requested";
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

    public Integer getMilestoneNumber() { return milestoneNumber; }
    public void setMilestoneNumber(Integer milestoneNumber) { this.milestoneNumber = milestoneNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDeliverableSummary() { return deliverableSummary; }
    public void setDeliverableSummary(String deliverableSummary) { this.deliverableSummary = deliverableSummary; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }

    public MilestoneStatus getStatus() { return status; }
    public void setStatus(MilestoneStatus status) { this.status = status; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public BigDecimal getTrancheAmount() { return trancheAmount; }
    public void setTrancheAmount(BigDecimal trancheAmount) { this.trancheAmount = trancheAmount; }

    public String getTrancheAmountFormatted() { return trancheAmountFormatted; }
    public void setTrancheAmountFormatted(String trancheAmountFormatted) { this.trancheAmountFormatted = trancheAmountFormatted; }

    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }

    public String getEvidenceDocUrl() { return evidenceDocUrl; }
    public void setEvidenceDocUrl(String evidenceDocUrl) { this.evidenceDocUrl = evidenceDocUrl; }

    public String getSubmissionRemarks() { return submissionRemarks; }
    public void setSubmissionRemarks(String submissionRemarks) { this.submissionRemarks = submissionRemarks; }

    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
