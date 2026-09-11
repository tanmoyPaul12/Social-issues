package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.MilestoneStatus;
import com.example.social_issues.projectlifecycle.model.ProjectMilestone;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MilestoneDto {

    private Long id;
    private Long projectId;
    private Integer milestoneNumber;
    private String title;
    private String deliverableSummary;
    private LocalDate targetDate;
    private LocalDate completedDate;
    private MilestoneStatus status;
    private BigDecimal trancheAmount;
    private Integer completionPercentage;
    private String reviewRemarks;
    private Long reviewedByUserId;
    private LocalDateTime reviewedAt;
    private List<DeliverableDto> deliverables = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MilestoneDto() {}

    public static MilestoneDto fromEntity(ProjectMilestone entity) {
        if (entity == null) return null;
        MilestoneDto dto = new MilestoneDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setMilestoneNumber(entity.getMilestoneNumber());
        dto.setTitle(entity.getTitle());
        dto.setDeliverableSummary(entity.getDeliverableSummary());
        dto.setTargetDate(entity.getTargetDate());
        dto.setCompletedDate(entity.getCompletedDate());
        dto.setStatus(entity.getStatus());
        dto.setTrancheAmount(entity.getTrancheAmount());
        dto.setCompletionPercentage(entity.getCompletionPercentage());
        dto.setReviewRemarks(entity.getReviewRemarks());
        dto.setReviewedByUserId(entity.getReviewedByUserId());
        dto.setReviewedAt(entity.getReviewedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getDeliverables() != null) {
            dto.setDeliverables(entity.getDeliverables().stream()
                    .map(DeliverableDto::fromEntity)
                    .toList());
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

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

    public BigDecimal getTrancheAmount() { return trancheAmount; }
    public void setTrancheAmount(BigDecimal trancheAmount) { this.trancheAmount = trancheAmount; }

    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }

    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }

    public Long getReviewedByUserId() { return reviewedByUserId; }
    public void setReviewedByUserId(Long reviewedByUserId) { this.reviewedByUserId = reviewedByUserId; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public List<DeliverableDto> getDeliverables() { return deliverables; }
    public void setDeliverables(List<DeliverableDto> deliverables) { this.deliverables = deliverables; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
