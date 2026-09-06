package com.example.social_issues.universitycollab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChallengeClaimRequest {

    @NotNull(message = "Issue ID is required")
    private Long issueId;

    @NotBlank(message = "AISHE code is required")
    private String aisheCode;

    private String universityName;

    private String nodalSpocName;

    private String leadFacultyName;

    @NotBlank(message = "Proposed approach is required")
    private String proposedApproach;

    private Integer estimatedTimelineMonths = 6;

    public ChallengeClaimRequest() {}

    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }

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
}
