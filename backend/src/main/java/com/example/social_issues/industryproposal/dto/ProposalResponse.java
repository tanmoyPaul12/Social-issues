package com.example.social_issues.industryproposal.dto;

import com.example.social_issues.industryproposal.model.ProposalStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProposalResponse {

    private Long id;
    private Long publicationId;
    private Long issueId;
    private String issueNumber;
    private String issueTitle;
    private Long industryUserId;
    private String companyName;
    private String contactEmail;
    private String contactPhone;
    private String proposalTitle;
    private String proposalSummary;
    private BigDecimal proposedBudget;
    private Integer proposedTimelineWeeks;
    private ProposalStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewerNotes;
    private String threadRefId;
    private List<ProposalDocumentResponse> documents = new ArrayList<>();

    public ProposalResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPublicationId() { return publicationId; }
    public void setPublicationId(Long publicationId) { this.publicationId = publicationId; }

    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }

    public String getIssueNumber() { return issueNumber; }
    public void setIssueNumber(String issueNumber) { this.issueNumber = issueNumber; }

    public String getIssueTitle() { return issueTitle; }
    public void setIssueTitle(String issueTitle) { this.issueTitle = issueTitle; }

    public Long getIndustryUserId() { return industryUserId; }
    public void setIndustryUserId(Long industryUserId) { this.industryUserId = industryUserId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getProposalTitle() { return proposalTitle; }
    public void setProposalTitle(String proposalTitle) { this.proposalTitle = proposalTitle; }

    public String getProposalSummary() { return proposalSummary; }
    public void setProposalSummary(String proposalSummary) { this.proposalSummary = proposalSummary; }

    public BigDecimal getProposedBudget() { return proposedBudget; }
    public void setProposedBudget(BigDecimal proposedBudget) { this.proposedBudget = proposedBudget; }

    public Integer getProposedTimelineWeeks() { return proposedTimelineWeeks; }
    public void setProposedTimelineWeeks(Integer proposedTimelineWeeks) { this.proposedTimelineWeeks = proposedTimelineWeeks; }

    public ProposalStatus getStatus() { return status; }
    public void setStatus(ProposalStatus status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public String getThreadRefId() { return threadRefId; }
    public void setThreadRefId(String threadRefId) { this.threadRefId = threadRefId; }

    public List<ProposalDocumentResponse> getDocuments() { return documents; }
    public void setDocuments(List<ProposalDocumentResponse> documents) { this.documents = documents; }
}
