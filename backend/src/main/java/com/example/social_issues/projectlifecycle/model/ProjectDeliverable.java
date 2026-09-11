package com.example.social_issues.projectlifecycle.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_deliverables", indexes = {
    @Index(name = "idx_deliv_milestone", columnList = "milestone_id"),
    @Index(name = "idx_deliv_type", columnList = "deliverable_type")
})
public class ProjectDeliverable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false)
    private ProjectMilestone milestone;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "deliverable_type", nullable = false, length = 50)
    private DeliverableType deliverableType = DeliverableType.OTHER;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_storage_key", length = 255)
    private String fileStorageKey;

    @Column(name = "external_repo_url", length = 500)
    private String externalRepoUrl;

    @Column(name = "submitted_by_user_id")
    private Long submittedByUserId;

    @Column(name = "submitted_by_name", length = 150)
    private String submittedByName;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public ProjectDeliverable() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProjectMilestone getMilestone() { return milestone; }
    public void setMilestone(ProjectMilestone milestone) { this.milestone = milestone; }

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
