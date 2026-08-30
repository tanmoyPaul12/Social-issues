package com.example.social_issues.industrypartnership.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ReviewMilestoneRequest {

    @NotBlank(message = "Review action is required")
    @Pattern(regexp = "APPROVE|REQUEST_REVISION", message = "Action must be APPROVE or REQUEST_REVISION")
    private String action;

    private String reviewRemarks;

    public ReviewMilestoneRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }
}
