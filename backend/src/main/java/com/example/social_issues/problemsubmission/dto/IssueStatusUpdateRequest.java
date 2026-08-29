package com.example.social_issues.problemsubmission.dto;

import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import jakarta.validation.constraints.NotNull;

public class IssueStatusUpdateRequest {

    @NotNull(message = "Status is mandatory")
    private IssueStatus status;

    private String reviewNotes;

    private IssuePriority priority;

    public IssueStatusUpdateRequest() {}

    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public IssuePriority getPriority() { return priority; }
    public void setPriority(IssuePriority priority) { this.priority = priority; }
}
