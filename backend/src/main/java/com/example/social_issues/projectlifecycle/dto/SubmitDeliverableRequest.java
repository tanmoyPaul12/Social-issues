package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.DeliverableType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubmitDeliverableRequest {

    @NotBlank(message = "Deliverable title is required")
    private String title;

    private String description;

    @NotNull(message = "Deliverable type is required")
    private DeliverableType deliverableType = DeliverableType.OTHER;

    private String fileUrl;
    private String fileStorageKey;
    private String externalRepoUrl;
    private String submittedByName;

    public SubmitDeliverableRequest() {}

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

    public String getSubmittedByName() { return submittedByName; }
    public void setSubmittedByName(String submittedByName) { this.submittedByName = submittedByName; }
}
