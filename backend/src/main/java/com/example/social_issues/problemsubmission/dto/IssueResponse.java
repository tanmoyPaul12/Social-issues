package com.example.social_issues.problemsubmission.dto;

import com.example.social_issues.auth.model.EntityType;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class IssueResponse {

    private Long id;
    private String issueNumber;
    private Long submitterId;
    private String submitterName;
    private String submitterPhone;
    private EntityType submitterEntityType;
    private String title;
    private String description;
    private IssueSector sector;
    private IssueStatus status;
    private IssuePriority priority;
    private String district;
    private String block;
    private String villageOrWard;
    private Double latitude;
    private Double longitude;
    private String addressDescription;
    private Integer affectedPopulation;
    private Integer estimatedImpactScore;
    private String contactName;
    private String contactPhone;
    private Boolean isAnonymous;
    private String reviewNotes;
    private String validationStatus;
    private String validationReportJson;
    private LocalDateTime resolvedAt;
    private List<AttachmentResponse> attachments = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IssueResponse() {}

    public static IssueResponse fromEntity(GrassrootIssue issue) {
        if (issue == null) return null;
        IssueResponse res = new IssueResponse();
        res.setId(issue.getId());
        res.setIssueNumber(issue.getIssueNumber());
        if (issue.getSubmitter() != null) {
            res.setSubmitterId(issue.getSubmitter().getId());
            if (Boolean.TRUE.equals(issue.getIsAnonymous())) {
                res.setSubmitterName("Anonymous Citizen");
                res.setSubmitterPhone(null);
            } else {
                res.setSubmitterName(issue.getSubmitter().getName());
                res.setSubmitterPhone(issue.getSubmitter().getPhone());
            }
        }
        res.setSubmitterEntityType(issue.getSubmitterEntityType());
        res.setTitle(issue.getTitle());
        res.setDescription(issue.getDescription());
        res.setSector(issue.getSector());
        res.setStatus(issue.getStatus());
        res.setPriority(issue.getPriority());
        res.setDistrict(issue.getDistrict());
        res.setBlock(issue.getBlock());
        res.setVillageOrWard(issue.getVillageOrWard());
        res.setLatitude(issue.getLatitude());
        res.setLongitude(issue.getLongitude());
        res.setAddressDescription(issue.getAddressDescription());
        res.setAffectedPopulation(issue.getAffectedPopulation());
        res.setEstimatedImpactScore(issue.getEstimatedImpactScore());
        res.setContactName(issue.getContactName());
        res.setContactPhone(issue.getContactPhone());
        res.setIsAnonymous(issue.getIsAnonymous());
        res.setReviewNotes(issue.getReviewNotes());
        res.setValidationStatus(issue.getValidationStatus());
        res.setValidationReportJson(issue.getValidationReportJson());
        res.setResolvedAt(issue.getResolvedAt());
        res.setCreatedAt(issue.getCreatedAt());
        res.setUpdatedAt(issue.getUpdatedAt());

        if (issue.getAttachments() != null) {
            List<AttachmentResponse> attList = issue.getAttachments().stream()
                    .map(AttachmentResponse::fromEntity)
                    .toList();
            res.setAttachments(attList);
        }

        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIssueNumber() { return issueNumber; }
    public void setIssueNumber(String issueNumber) { this.issueNumber = issueNumber; }

    public Long getSubmitterId() { return submitterId; }
    public void setSubmitterId(Long submitterId) { this.submitterId = submitterId; }

    public String getSubmitterName() { return submitterName; }
    public void setSubmitterName(String submitterName) { this.submitterName = submitterName; }

    public String getSubmitterPhone() { return submitterPhone; }
    public void setSubmitterPhone(String submitterPhone) { this.submitterPhone = submitterPhone; }

    public EntityType getSubmitterEntityType() { return submitterEntityType; }
    public void setSubmitterEntityType(EntityType submitterEntityType) { this.submitterEntityType = submitterEntityType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }

    public IssuePriority getPriority() { return priority; }
    public void setPriority(IssuePriority priority) { this.priority = priority; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getVillageOrWard() { return villageOrWard; }
    public void setVillageOrWard(String villageOrWard) { this.villageOrWard = villageOrWard; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }

    public Integer getAffectedPopulation() { return affectedPopulation; }
    public void setAffectedPopulation(Integer affectedPopulation) { this.affectedPopulation = affectedPopulation; }

    public Integer getEstimatedImpactScore() { return estimatedImpactScore; }
    public void setEstimatedImpactScore(Integer estimatedImpactScore) { this.estimatedImpactScore = estimatedImpactScore; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean anonymous) { isAnonymous = anonymous; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public String getValidationStatus() { return validationStatus; }
    public void setValidationStatus(String validationStatus) { this.validationStatus = validationStatus; }

    public String getValidationReportJson() { return validationReportJson; }
    public void setValidationReportJson(String validationReportJson) { this.validationReportJson = validationReportJson; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public List<AttachmentResponse> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentResponse> attachments) { this.attachments = attachments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
