package com.example.social_issues.industryproposal.dto;

public class AcceptProposalRequest {

    private String reviewerNotes;

    public AcceptProposalRequest() {}

    public AcceptProposalRequest(String reviewerNotes) {
        this.reviewerNotes = reviewerNotes;
    }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }
}
