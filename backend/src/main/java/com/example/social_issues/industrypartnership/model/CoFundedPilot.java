package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.problemsubmission.model.IssueSector;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "co_funded_pilots", indexes = {
    @Index(name = "idx_pilots_industry_profile", columnList = "industry_profile_id"),
    @Index(name = "idx_pilots_status", columnList = "status"),
    @Index(name = "idx_pilots_health", columnList = "health_status"),
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

    @Column(name = "faculty_lead_name", length = 150)
    private String facultyLeadName;

    @Column(name = "faculty_lead_designation", length = 150)
    private String facultyLeadDesignation;

    @Column(name = "faculty_lead_email", length = 150)
    private String facultyLeadEmail;

    @Column(name = "student_lead_name", length = 150)
    private String studentLeadName;

    @Column(name = "student_lead_contact", length = 100)
    private String studentLeadContact;

    @Column(name = "corporate_mentor_name", length = 150)
    private String corporateMentorName;

    @Column(name = "corporate_mentor_designation", length = 150)
    private String corporateMentorDesignation;

    @Column(name = "target_district", length = 100)
    private String targetDistrict;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 50)
    private PilotStage stage = PilotStage.PROPOSAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PilotStatus status = PilotStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status", nullable = false, length = 50)
    private PilotHealthStatus healthStatus = PilotHealthStatus.ON_TRACK;

    @Column(name = "current_milestone")
    private Integer currentMilestone = 1;

    @Column(name = "total_milestones")
    private Integer totalMilestones = 4;

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(name = "total_budget", precision = 18, scale = 2)
    private BigDecimal totalBudget = BigDecimal.ZERO;

    @Column(name = "disbursed_budget", precision = 18, scale = 2)
    private BigDecimal disbursedBudget = BigDecimal.ZERO;

    @Column(name = "next_deliverable_date")
    private LocalDate nextDeliverableDate;

    @Column(name = "target_completion_date")
    private LocalDate targetCompletionDate;

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

    public String getFacultyLeadName() { return facultyLeadName; }
    public void setFacultyLeadName(String facultyLeadName) { this.facultyLeadName = facultyLeadName; }

    public String getFacultyLeadDesignation() { return facultyLeadDesignation; }
    public void setFacultyLeadDesignation(String facultyLeadDesignation) { this.facultyLeadDesignation = facultyLeadDesignation; }

    public String getFacultyLeadEmail() { return facultyLeadEmail; }
    public void setFacultyLeadEmail(String facultyLeadEmail) { this.facultyLeadEmail = facultyLeadEmail; }

    public String getStudentLeadName() { return studentLeadName; }
    public void setStudentLeadName(String studentLeadName) { this.studentLeadName = studentLeadName; }

    public String getStudentLeadContact() { return studentLeadContact; }
    public void setStudentLeadContact(String studentLeadContact) { this.studentLeadContact = studentLeadContact; }

    public String getCorporateMentorName() { return corporateMentorName; }
    public void setCorporateMentorName(String corporateMentorName) { this.corporateMentorName = corporateMentorName; }

    public String getCorporateMentorDesignation() { return corporateMentorDesignation; }
    public void setCorporateMentorDesignation(String corporateMentorDesignation) { this.corporateMentorDesignation = corporateMentorDesignation; }

    public String getTargetDistrict() { return targetDistrict; }
    public void setTargetDistrict(String targetDistrict) { this.targetDistrict = targetDistrict; }

    public PilotStage getStage() { return stage; }
    public void setStage(PilotStage stage) { this.stage = stage; }

    public PilotStatus getStatus() { return status; }
    public void setStatus(PilotStatus status) { this.status = status; }

    public PilotHealthStatus getHealthStatus() { return healthStatus; }
    public void setHealthStatus(PilotHealthStatus healthStatus) { this.healthStatus = healthStatus; }

    public Integer getCurrentMilestone() { return currentMilestone; }
    public void setCurrentMilestone(Integer currentMilestone) { this.currentMilestone = currentMilestone; }

    public Integer getTotalMilestones() { return totalMilestones; }
    public void setTotalMilestones(Integer totalMilestones) { this.totalMilestones = totalMilestones; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public BigDecimal getTotalBudget() { return totalBudget; }
    public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }

    public BigDecimal getDisbursedBudget() { return disbursedBudget; }
    public void setDisbursedBudget(BigDecimal disbursedBudget) { this.disbursedBudget = disbursedBudget; }

    public LocalDate getNextDeliverableDate() { return nextDeliverableDate; }
    public void setNextDeliverableDate(LocalDate nextDeliverableDate) { this.nextDeliverableDate = nextDeliverableDate; }

    public LocalDate getTargetCompletionDate() { return targetCompletionDate; }
    public void setTargetCompletionDate(LocalDate targetCompletionDate) { this.targetCompletionDate = targetCompletionDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
