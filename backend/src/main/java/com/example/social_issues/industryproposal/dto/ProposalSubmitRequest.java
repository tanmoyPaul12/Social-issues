package com.example.social_issues.industryproposal.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ProposalSubmitRequest {

    @NotBlank(message = "Proposal title is required")
    private String proposalTitle;

    @NotBlank(message = "Proposal summary is required")
    private String proposalSummary;

    private BigDecimal proposedBudget;

    private Integer proposedTimelineWeeks;

    private String contactEmail;

    private String contactPhone;

    public ProposalSubmitRequest() {}

    public String getProposalTitle() { return proposalTitle; }
    public void setProposalTitle(String proposalTitle) { this.proposalTitle = proposalTitle; }

    public String getProposalSummary() { return proposalSummary; }
    public void setProposalSummary(String proposalSummary) { this.proposalSummary = proposalSummary; }

    public BigDecimal getProposedBudget() { return proposedBudget; }
    public void setProposedBudget(BigDecimal proposedBudget) { this.proposedBudget = proposedBudget; }

    public Integer getProposedTimelineWeeks() { return proposedTimelineWeeks; }
    public void setProposedTimelineWeeks(Integer proposedTimelineWeeks) { this.proposedTimelineWeeks = proposedTimelineWeeks; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}
