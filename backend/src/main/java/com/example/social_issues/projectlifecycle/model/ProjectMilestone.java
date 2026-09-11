package com.example.social_issues.projectlifecycle.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_milestones", indexes = {
    @Index(name = "idx_milestone_project_id", columnList = "project_id"),
    @Index(name = "idx_milestone_status", columnList = "status"),
    @Index(name = "idx_milestone_target_date", columnList = "target_date")
})
public class ProjectMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "milestone_number", nullable = false)
    private Integer milestoneNumber;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "deliverable_summary", columnDefinition = "TEXT")
    private String deliverableSummary;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private MilestoneStatus status = MilestoneStatus.UPCOMING;

    @Column(name = "tranche_amount", precision = 18, scale = 2)
    private BigDecimal trancheAmount = BigDecimal.ZERO;

    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage = 0;

    @Column(name = "review_remarks", columnDefinition = "TEXT")
    private String reviewRemarks;

    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<ProjectDeliverable> deliverables = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public ProjectMilestone() {}

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

    public List<ProjectDeliverable> getDeliverables() { return deliverables; }
    public void setDeliverables(List<ProjectDeliverable> deliverables) { this.deliverables = deliverables; }

    public void addDeliverable(ProjectDeliverable deliverable) {
        deliverables.add(deliverable);
        deliverable.setMilestone(this);
    }

    public void removeDeliverable(ProjectDeliverable deliverable) {
        deliverables.remove(deliverable);
        deliverable.setMilestone(null);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
