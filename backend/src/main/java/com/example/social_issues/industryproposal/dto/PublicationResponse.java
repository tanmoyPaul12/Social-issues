package com.example.social_issues.industryproposal.dto;

import java.time.LocalDateTime;

public class PublicationResponse {

    private Long id;
    private Long issueId;
    private String issueNumber;
    private String issueTitle;
    private String issueDescription;
    private String sector;
    private String district;
    private String block;
    private String priority;
    private String submitterName;
    private String submitterRole;
    private String assignedHEI;
    private Boolean isPublishedToIndustry;
    private LocalDateTime publishedAt;
    private String publishedByName;
    private String publishedByRole;
    private String generatedPdfUrl;
    private String collegeCustomNotes;
    private String collegeGuidelineDocUrl;
    private String collegeGuidelineDocName;
    private long proposalsCount;
    private Long acceptedProposalId;

    public PublicationResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }

    public String getIssueNumber() { return issueNumber; }
    public void setIssueNumber(String issueNumber) { this.issueNumber = issueNumber; }

    public String getIssueTitle() { return issueTitle; }
    public void setIssueTitle(String issueTitle) { this.issueTitle = issueTitle; }

    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getSubmitterName() { return submitterName; }
    public void setSubmitterName(String submitterName) { this.submitterName = submitterName; }

    public String getSubmitterRole() { return submitterRole; }
    public void setSubmitterRole(String submitterRole) { this.submitterRole = submitterRole; }

    public String getAssignedHEI() { return assignedHEI; }
    public void setAssignedHEI(String assignedHEI) { this.assignedHEI = assignedHEI; }

    public Boolean getIsPublishedToIndustry() { return isPublishedToIndustry; }
    public void setIsPublishedToIndustry(Boolean isPublishedToIndustry) { this.isPublishedToIndustry = isPublishedToIndustry; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    public String getPublishedByName() { return publishedByName; }
    public void setPublishedByName(String publishedByName) { this.publishedByName = publishedByName; }

    public String getPublishedByRole() { return publishedByRole; }
    public void setPublishedByRole(String publishedByRole) { this.publishedByRole = publishedByRole; }

    public String getGeneratedPdfUrl() { return generatedPdfUrl; }
    public void setGeneratedPdfUrl(String generatedPdfUrl) { this.generatedPdfUrl = generatedPdfUrl; }

    public String getCollegeCustomNotes() { return collegeCustomNotes; }
    public void setCollegeCustomNotes(String collegeCustomNotes) { this.collegeCustomNotes = collegeCustomNotes; }

    public String getCollegeGuidelineDocUrl() { return collegeGuidelineDocUrl; }
    public void setCollegeGuidelineDocUrl(String collegeGuidelineDocUrl) { this.collegeGuidelineDocUrl = collegeGuidelineDocUrl; }

    public String getCollegeGuidelineDocName() { return collegeGuidelineDocName; }
    public void setCollegeGuidelineDocName(String collegeGuidelineDocName) { this.collegeGuidelineDocName = collegeGuidelineDocName; }

    public long getProposalsCount() { return proposalsCount; }
    public void setProposalsCount(long proposalsCount) { this.proposalsCount = proposalsCount; }

    public Long getAcceptedProposalId() { return acceptedProposalId; }
    public void setAcceptedProposalId(Long acceptedProposalId) { this.acceptedProposalId = acceptedProposalId; }
}
