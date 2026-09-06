package com.example.social_issues.universitycollab.model;

import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_claims", indexes = {
    @Index(name = "idx_claim_aishe", columnList = "aishe_code"),
    @Index(name = "idx_claim_issue_id", columnList = "issue_id"),
    @Index(name = "idx_claim_status", columnList = "status")
})
public class ChallengeClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private GrassrootIssue issue;

    @Column(name = "aishe_code", nullable = false, length = 60)
    private String aisheCode;

    @Column(name = "university_name", nullable = false, length = 250)
    private String universityName;

    @Column(name = "nodal_spoc_name", length = 150)
    private String nodalSpocName;

    @Column(name = "lead_faculty_name", length = 150)
    private String leadFacultyName;

    @Column(name = "proposed_approach", columnDefinition = "TEXT")
    private String proposedApproach;

    @Column(name = "estimated_timeline_months")
    private Integer estimatedTimelineMonths = 6;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ClaimStatus status = ClaimStatus.APPROVED;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ChallengeClaim() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public GrassrootIssue getIssue() { return issue; }
    public void setIssue(GrassrootIssue issue) { this.issue = issue; }

    public String getAisheCode() { return aisheCode; }
    public void setAisheCode(String aisheCode) { this.aisheCode = aisheCode; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getNodalSpocName() { return nodalSpocName; }
    public void setNodalSpocName(String nodalSpocName) { this.nodalSpocName = nodalSpocName; }

    public String getLeadFacultyName() { return leadFacultyName; }
    public void setLeadFacultyName(String leadFacultyName) { this.leadFacultyName = leadFacultyName; }

    public String getProposedApproach() { return proposedApproach; }
    public void setProposedApproach(String proposedApproach) { this.proposedApproach = proposedApproach; }

    public Integer getEstimatedTimelineMonths() { return estimatedTimelineMonths; }
    public void setEstimatedTimelineMonths(Integer estimatedTimelineMonths) { this.estimatedTimelineMonths = estimatedTimelineMonths; }

    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
