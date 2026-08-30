package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.problemsubmission.model.IssueSector;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "co_funded_pilots", indexes = {
    @Index(name = "idx_pilots_industry_profile", columnList = "industry_profile_id"),
    @Index(name = "idx_pilots_status", columnList = "status"),
    @Index(name = "idx_pilots_sector", columnList = "sector")
})
public class CoFundedPilot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "abstract_description", columnDefinition = "TEXT")
    private String abstractDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "sector", nullable = false, length = 50)
    private IssueSector sector = IssueSector.OTHER;

    @Column(name = "university_id")
    private Long universityId;

    @Column(name = "university_name", length = 200)
    private String universityName;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 50)
    private PilotStage stage = PilotStage.PROPOSAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PilotStatus status = PilotStatus.ACTIVE;

    @Column(name = "current_milestone")
    private Integer currentMilestone = 1;

    @Column(name = "total_milestones")
    private Integer totalMilestones = 4;

    @Column(name = "next_deliverable_date")
    private LocalDate nextDeliverableDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public CoFundedPilot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractDescription() { return abstractDescription; }
    public void setAbstractDescription(String abstractDescription) { this.abstractDescription = abstractDescription; }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public Long getUniversityId() { return universityId; }
    public void setUniversityId(Long universityId) { this.universityId = universityId; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public PilotStage getStage() { return stage; }
    public void setStage(PilotStage stage) { this.stage = stage; }

    public PilotStatus getStatus() { return status; }
    public void setStatus(PilotStatus status) { this.status = status; }

    public Integer getCurrentMilestone() { return currentMilestone; }
    public void setCurrentMilestone(Integer currentMilestone) { this.currentMilestone = currentMilestone; }

    public Integer getTotalMilestones() { return totalMilestones; }
    public void setTotalMilestones(Integer totalMilestones) { this.totalMilestones = totalMilestones; }

    public LocalDate getNextDeliverableDate() { return nextDeliverableDate; }
    public void setNextDeliverableDate(LocalDate nextDeliverableDate) { this.nextDeliverableDate = nextDeliverableDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
