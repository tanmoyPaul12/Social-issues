package com.example.social_issues.problemsubmission.dto;

import com.example.social_issues.auth.model.EntityType;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;

import java.time.LocalDateTime;

public class IssueSummaryResponse {

    private Long id;
    private String issueNumber;
    private String title;
    private String snippet;
    private IssueSector sector;
    private IssueStatus status;
    private IssuePriority priority;
    private EntityType submitterEntityType;
    private String submitterName;
    private String district;
    private String block;
    private Integer affectedPopulation;
    private int attachmentCount;
    private String primaryThumbnailUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IssueSummaryResponse() {}

    public static IssueSummaryResponse fromEntity(GrassrootIssue issue) {
        if (issue == null) return null;
        IssueSummaryResponse res = new IssueSummaryResponse();
        res.setId(issue.getId());
        res.setIssueNumber(issue.getIssueNumber());
        res.setTitle(issue.getTitle());

        String desc = issue.getDescription();
        if (desc != null && desc.length() > 140) {
            res.setSnippet(desc.substring(0, 137) + "...");
        } else {
            res.setSnippet(desc);
        }

        res.setSector(issue.getSector());
        res.setStatus(issue.getStatus());
        res.setPriority(issue.getPriority());
        res.setSubmitterEntityType(issue.getSubmitterEntityType());
        if (issue.getSubmitter() != null) {
            if (Boolean.TRUE.equals(issue.getIsAnonymous())) {
                res.setSubmitterName("Anonymous Citizen");
            } else {
                res.setSubmitterName(issue.getSubmitter().getName());
            }
        }
        res.setDistrict(issue.getDistrict());
        res.setBlock(issue.getBlock());
        res.setAffectedPopulation(issue.getAffectedPopulation());
        res.setCreatedAt(issue.getCreatedAt());
        res.setUpdatedAt(issue.getUpdatedAt());

        if (issue.getAttachments() != null) {
            res.setAttachmentCount(issue.getAttachments().size());
            issue.getAttachments().stream()
                    .filter(a -> a.getFileType() == com.example.social_issues.problemsubmission.model.AttachmentType.PHOTO)
                    .findFirst()
                    .ifPresent(a -> res.setPrimaryThumbnailUrl(a.getFileUrl()));
        }

        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIssueNumber() { return issueNumber; }
    public void setIssueNumber(String issueNumber) { this.issueNumber = issueNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }

    public IssuePriority getPriority() { return priority; }
    public void setPriority(IssuePriority priority) { this.priority = priority; }

    public EntityType getSubmitterEntityType() { return submitterEntityType; }
    public void setSubmitterEntityType(EntityType submitterEntityType) { this.submitterEntityType = submitterEntityType; }

    public String getSubmitterName() { return submitterName; }
    public void setSubmitterName(String submitterName) { this.submitterName = submitterName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public Integer getAffectedPopulation() { return affectedPopulation; }
    public void setAffectedPopulation(Integer affectedPopulation) { this.affectedPopulation = affectedPopulation; }

    public int getAttachmentCount() { return attachmentCount; }
    public void setAttachmentCount(int attachmentCount) { this.attachmentCount = attachmentCount; }

    public String getPrimaryThumbnailUrl() { return primaryThumbnailUrl; }
    public void setPrimaryThumbnailUrl(String primaryThumbnailUrl) { this.primaryThumbnailUrl = primaryThumbnailUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
