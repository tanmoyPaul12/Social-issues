package com.example.social_issues.universitycollab.dto;

import com.example.social_issues.universitycollab.model.ChallengeClaim;
import com.example.social_issues.universitycollab.model.ClaimStatus;

import java.time.LocalDateTime;

public class ChallengeClaimResponse {

    private Long id;
    private Long issueId;
    private String issueNumber;
    private String issueTitle;
    private String aisheCode;
    private String universityName;
    private String nodalSpocName;
    private String leadFacultyName;
    private String proposedApproach;
    private Integer estimatedTimelineMonths;
    private ClaimStatus status;
    private LocalDateTime createdAt;

    public ChallengeClaimResponse() {}

    public static ChallengeClaimResponse fromEntity(ChallengeClaim entity) {
        ChallengeClaimResponse res = new ChallengeClaimResponse();
        res.setId(entity.getId());
        res.setIssueId(entity.getIssue().getId());
        res.setIssueNumber(entity.getIssue().getIssueNumber());
        res.setIssueTitle(entity.getIssue().getTitle());
        res.setAisheCode(entity.getAisheCode());
        res.setUniversityName(entity.getUniversityName());
        res.setNodalSpocName(entity.getNodalSpocName());
        res.setLeadFacultyName(entity.getLeadFacultyName());
        res.setProposedApproach(entity.getProposedApproach());
        res.setEstimatedTimelineMonths(entity.getEstimatedTimelineMonths());
        res.setStatus(entity.getStatus());
        res.setCreatedAt(entity.getCreatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }

    public String getIssueNumber() { return issueNumber; }
    public void setIssueNumber(String issueNumber) { this.issueNumber = issueNumber; }

    public String getIssueTitle() { return issueTitle; }
    public void setIssueTitle(String issueTitle) { this.issueTitle = issueTitle; }

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
