package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.EmailDigestFrequency;
import java.util.List;

public class UpdateNotificationPreferencesRequest {

    private List<String> preferredSectors;
    private String minReadinessLevel;

    private Boolean notifyNewMatchingProjects;
    private Boolean notifyMilestoneSubmissions;
    private Boolean notifyDisbursementTrancheDue;
    private Boolean notifyComplianceDeadlines;
    private Boolean notifyDiscussionMessages;

    private EmailDigestFrequency emailDigestFrequency;
    private String alertEmail;

    public UpdateNotificationPreferencesRequest() {}

    public List<String> getPreferredSectors() { return preferredSectors; }
    public void setPreferredSectors(List<String> preferredSectors) { this.preferredSectors = preferredSectors; }

    public String getMinReadinessLevel() { return minReadinessLevel; }
    public void setMinReadinessLevel(String minReadinessLevel) { this.minReadinessLevel = minReadinessLevel; }

    public Boolean getNotifyNewMatchingProjects() { return notifyNewMatchingProjects; }
    public void setNotifyNewMatchingProjects(Boolean notifyNewMatchingProjects) { this.notifyNewMatchingProjects = notifyNewMatchingProjects; }

    public Boolean getNotifyMilestoneSubmissions() { return notifyMilestoneSubmissions; }
    public void setNotifyMilestoneSubmissions(Boolean notifyMilestoneSubmissions) { this.notifyMilestoneSubmissions = notifyMilestoneSubmissions; }

    public Boolean getNotifyDisbursementTrancheDue() { return notifyDisbursementTrancheDue; }
    public void setNotifyDisbursementTrancheDue(Boolean notifyDisbursementTrancheDue) { this.notifyDisbursementTrancheDue = notifyDisbursementTrancheDue; }

    public Boolean getNotifyComplianceDeadlines() { return notifyComplianceDeadlines; }
    public void setNotifyComplianceDeadlines(Boolean notifyComplianceDeadlines) { this.notifyComplianceDeadlines = notifyComplianceDeadlines; }

    public Boolean getNotifyDiscussionMessages() { return notifyDiscussionMessages; }
    public void setNotifyDiscussionMessages(Boolean notifyDiscussionMessages) { this.notifyDiscussionMessages = notifyDiscussionMessages; }

    public EmailDigestFrequency getEmailDigestFrequency() { return emailDigestFrequency; }
    public void setEmailDigestFrequency(EmailDigestFrequency emailDigestFrequency) { this.emailDigestFrequency = emailDigestFrequency; }

    public String getAlertEmail() { return alertEmail; }
    public void setAlertEmail(String alertEmail) { this.alertEmail = alertEmail; }
}
