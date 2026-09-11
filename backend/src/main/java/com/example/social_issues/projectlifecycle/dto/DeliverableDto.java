package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.DeliverableType;
import com.example.social_issues.projectlifecycle.model.ProjectDeliverable;

import java.time.LocalDateTime;

public class DeliverableDto {

    private Long id;
    private Long milestoneId;
    private String title;
    private String description;
    private DeliverableType deliverableType;
    private String fileUrl;
    private String fileStorageKey;
    private String externalRepoUrl;
    private Long submittedByUserId;
    private String submittedByName;
    private Boolean isApproved;
    private String reviewNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DeliverableDto() {}

    public static DeliverableDto fromEntity(ProjectDeliverable entity) {
        if (entity == null) return null;
        DeliverableDto dto = new DeliverableDto();
        dto.setId(entity.getId());
        dto.setMilestoneId(entity.getMilestone() != null ? entity.getMilestone().getId() : null);
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setDeliverableType(entity.getDeliverableType());
        dto.setFileUrl(entity.getFileUrl());
        dto.setFileStorageKey(entity.getFileStorageKey());
        dto.setExternalRepoUrl(entity.getExternalRepoUrl());
        dto.setSubmittedByUserId(entity.getSubmittedByUserId());
        dto.setSubmittedByName(entity.getSubmittedByName());
        dto.setIsApproved(entity.getIsApproved());
        dto.setReviewNotes(entity.getReviewNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMilestoneId() { return milestoneId; }
    public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DeliverableType getDeliverableType() { return deliverableType; }
    public void setDeliverableType(DeliverableType deliverableType) { this.deliverableType = deliverableType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileStorageKey() { return fileStorageKey; }
    public void setFileStorageKey(String fileStorageKey) { this.fileStorageKey = fileStorageKey; }

    public String getExternalRepoUrl() { return externalRepoUrl; }
    public void setExternalRepoUrl(String externalRepoUrl) { this.externalRepoUrl = externalRepoUrl; }

    public Long getSubmittedByUserId() { return submittedByUserId; }
    public void setSubmittedByUserId(Long submittedByUserId) { this.submittedByUserId = submittedByUserId; }

    public String getSubmittedByName() { return submittedByName; }
    public void setSubmittedByName(String submittedByName) { this.submittedByName = submittedByName; }

    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
