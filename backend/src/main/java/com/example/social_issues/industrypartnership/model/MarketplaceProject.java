package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.problemsubmission.model.IssueSector;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_projects", indexes = {
    @Index(name = "idx_marketplace_sector", columnList = "sector"),
    @Index(name = "idx_marketplace_stage", columnList = "stage"),
    @Index(name = "idx_marketplace_status", columnList = "status"),
    @Index(name = "idx_marketplace_university", columnList = "university_id"),
    @Index(name = "idx_marketplace_created_at", columnList = "created_at")
})
public class MarketplaceProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "abstract_description", columnDefinition = "TEXT")
    private String abstractDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "sector", nullable = false, length = 50)
    private IssueSector sector = IssueSector.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 50)
    private MarketplaceStage stage = MarketplaceStage.PROTOTYPE;

    @Column(name = "university_id")
    private Long universityId;

    @Column(name = "university_name", length = 250)
    private String universityName;

    @Column(name = "lead_faculty_mentor", length = 200)
    private String leadFacultyMentor;

    @Column(name = "student_lead", length = 200)
    private String studentLead;

    @Column(name = "team_size")
    private Integer teamSize = 4;

    @Column(name = "funding_ask_amount", precision = 15, scale = 2)
    private BigDecimal fundingAskAmount = BigDecimal.ZERO;

    @Column(name = "funding_committed_amount", precision = 15, scale = 2)
    private BigDecimal fundingCommittedAmount = BigDecimal.ZERO;

    @Column(name = "trl_level")
    private Integer trlLevel = 4; // Technology Readiness Level (1-9)

    @Column(name = "target_district", length = 100)
    private String targetDistrict;

    @Column(name = "proposal_pdf_url", length = 500)
    private String proposalPdfUrl;

    @Column(name = "prototype_image_url", length = 500)
    private String prototypeImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private MarketplaceStatus status = MarketplaceStatus.PUBLISHED;

    @Column(name = "closing_date")
    private LocalDate closingDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public MarketplaceProject() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractDescription() { return abstractDescription; }
    public void setAbstractDescription(String abstractDescription) { this.abstractDescription = abstractDescription; }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public MarketplaceStage getStage() { return stage; }
    public void setStage(MarketplaceStage stage) { this.stage = stage; }

    public Long getUniversityId() { return universityId; }
    public void setUniversityId(Long universityId) { this.universityId = universityId; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getLeadFacultyMentor() { return leadFacultyMentor; }
    public void setLeadFacultyMentor(String leadFacultyMentor) { this.leadFacultyMentor = leadFacultyMentor; }

    public String getStudentLead() { return studentLead; }
    public void setStudentLead(String studentLead) { this.studentLead = studentLead; }

    public Integer getTeamSize() { return teamSize; }
    public void setTeamSize(Integer teamSize) { this.teamSize = teamSize; }

    public BigDecimal getFundingAskAmount() { return fundingAskAmount; }
    public void setFundingAskAmount(BigDecimal fundingAskAmount) { this.fundingAskAmount = fundingAskAmount; }

    public BigDecimal getFundingCommittedAmount() { return fundingCommittedAmount; }
    public void setFundingCommittedAmount(BigDecimal fundingCommittedAmount) { this.fundingCommittedAmount = fundingCommittedAmount; }

    public Integer getTrlLevel() { return trlLevel; }
    public void setTrlLevel(Integer trlLevel) { this.trlLevel = trlLevel; }

    public String getTargetDistrict() { return targetDistrict; }
    public void setTargetDistrict(String targetDistrict) { this.targetDistrict = targetDistrict; }

    public String getProposalPdfUrl() { return proposalPdfUrl; }
    public void setProposalPdfUrl(String proposalPdfUrl) { this.proposalPdfUrl = proposalPdfUrl; }

    public String getPrototypeImageUrl() { return prototypeImageUrl; }
    public void setPrototypeImageUrl(String prototypeImageUrl) { this.prototypeImageUrl = prototypeImageUrl; }

    public MarketplaceStatus getStatus() { return status; }
    public void setStatus(MarketplaceStatus status) { this.status = status; }

    public LocalDate getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDate closingDate) { this.closingDate = closingDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
