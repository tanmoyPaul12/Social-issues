package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_engagements", indexes = {
    @Index(name = "idx_engagement_project_id", columnList = "project_id"),
    @Index(name = "idx_engagement_industry_id", columnList = "industry_profile_id"),
    @Index(name = "idx_engagement_type", columnList = "engagement_type"),
    @Index(name = "idx_engagement_status", columnList = "status")
})
public class MarketplaceEngagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private MarketplaceProject project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "engagement_type", nullable = false, length = 50)
    private EngagementType engagementType = EngagementType.COMMIT_CSR_FUNDING;

    @Column(name = "proposed_funding_amount", precision = 15, scale = 2)
    private BigDecimal proposedFundingAmount;

    @Column(name = "mentor_nominee_name", length = 150)
    private String mentorNomineeName;

    @Column(name = "mentor_nominee_designation", length = 150)
    private String mentorNomineeDesignation;

    @Column(name = "mentor_email", length = 150)
    private String mentorEmail;

    @Column(name = "message_notes", columnDefinition = "TEXT")
    private String messageNotes;

    @Column(name = "csr_schedule_vii_head", length = 200)
    private String csrScheduleViiHead;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private EngagementStatus status = EngagementStatus.SUBMITTED;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public MarketplaceEngagement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MarketplaceProject getProject() { return project; }
    public void setProject(MarketplaceProject project) { this.project = project; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public EngagementType getEngagementType() { return engagementType; }
    public void setEngagementType(EngagementType engagementType) { this.engagementType = engagementType; }

    public BigDecimal getProposedFundingAmount() { return proposedFundingAmount; }
    public void setProposedFundingAmount(BigDecimal proposedFundingAmount) { this.proposedFundingAmount = proposedFundingAmount; }

    public String getMentorNomineeName() { return mentorNomineeName; }
    public void setMentorNomineeName(String mentorNomineeName) { this.mentorNomineeName = mentorNomineeName; }

    public String getMentorNomineeDesignation() { return mentorNomineeDesignation; }
    public void setMentorNomineeDesignation(String mentorNomineeDesignation) { this.mentorNomineeDesignation = mentorNomineeDesignation; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public String getMessageNotes() { return messageNotes; }
    public void setMessageNotes(String messageNotes) { this.messageNotes = messageNotes; }

    public String getCsrScheduleViiHead() { return csrScheduleViiHead; }
    public void setCsrScheduleViiHead(String csrScheduleViiHead) { this.csrScheduleViiHead = csrScheduleViiHead; }

    public EngagementStatus getStatus() { return status; }
    public void setStatus(EngagementStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
