package com.example.social_issues.industrypartnership.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pilot_milestones", indexes = {
    @Index(name = "idx_milestone_pilot", columnList = "pilot_id"),
    @Index(name = "idx_pilot_milestone_status", columnList = "status")
})
public class PilotMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false)
    private CoFundedPilot pilot;

    @Column(name = "milestone_number", nullable = false)
    private Integer milestoneNumber;

    @Column(name = "title", nullable = false, length = 300)
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

    @Column(name = "completion_percentage")
    private Integer completionPercentage = 0;

    @Column(name = "evidence_doc_url", length = 500)
    private String evidenceDocUrl;

    @Column(name = "submission_remarks", columnDefinition = "TEXT")
    private String submissionRemarks;

    @Column(name = "review_remarks", columnDefinition = "TEXT")
    private String reviewRemarks;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewer_user_id")
    private Long reviewerUserId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public PilotMilestone() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CoFundedPilot getPilot() { return pilot; }
    public void setPilot(CoFundedPilot pilot) { this.pilot = pilot; }

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

    public String getEvidenceDocUrl() { return evidenceDocUrl; }
    public void setEvidenceDocUrl(String evidenceDocUrl) { this.evidenceDocUrl = evidenceDocUrl; }

    public String getSubmissionRemarks() { return submissionRemarks; }
    public void setSubmissionRemarks(String submissionRemarks) { this.submissionRemarks = submissionRemarks; }

    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public Long getReviewerUserId() { return reviewerUserId; }
    public void setReviewerUserId(Long reviewerUserId) { this.reviewerUserId = reviewerUserId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
