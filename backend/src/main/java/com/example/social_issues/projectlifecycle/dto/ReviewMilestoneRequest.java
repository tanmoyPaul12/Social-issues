package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.MilestoneStatus;
import jakarta.validation.constraints.NotNull;

public class ReviewMilestoneRequest {

    @NotNull(message = "Review status is required")
    private MilestoneStatus status;

    private String reviewRemarks;

    private Integer completionPercentage;

    public ReviewMilestoneRequest() {}

    public MilestoneStatus getStatus() { return status; }
    public void setStatus(MilestoneStatus status) { this.status = status; }

    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }

    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }
}
