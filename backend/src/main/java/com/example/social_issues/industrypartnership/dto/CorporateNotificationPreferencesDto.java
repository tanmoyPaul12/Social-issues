package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.CorporateNotificationPreference;
import com.example.social_issues.industrypartnership.model.EmailDigestFrequency;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;
import java.util.List;

public class CorporateNotificationPreferencesDto {

    private Long id;
    private Long industryProfileId;
    private List<String> preferredSectors;
    private String minReadinessLevel;

    private Boolean notifyNewMatchingProjects;
    private Boolean notifyMilestoneSubmissions;
    private Boolean notifyDisbursementTrancheDue;
    private Boolean notifyComplianceDeadlines;
    private Boolean notifyDiscussionMessages;

    private EmailDigestFrequency emailDigestFrequency;
    private String alertEmail;

    public CorporateNotificationPreferencesDto() {}

    public static CorporateNotificationPreferencesDto fromEntity(CorporateNotificationPreference p, ObjectMapper mapper) {
        CorporateNotificationPreferencesDto dto = new CorporateNotificationPreferencesDto();
        dto.setId(p.getId());
        if (p.getIndustryProfile() != null) {
            dto.setIndustryProfileId(p.getIndustryProfile().getId());
        }
        dto.setMinReadinessLevel(p.getMinReadinessLevel());
        dto.setNotifyNewMatchingProjects(p.getNotifyNewMatchingProjects());
        dto.setNotifyMilestoneSubmissions(p.getNotifyMilestoneSubmissions());
        dto.setNotifyDisbursementTrancheDue(p.getNotifyDisbursementTrancheDue());
        dto.setNotifyComplianceDeadlines(p.getNotifyComplianceDeadlines());
        dto.setNotifyDiscussionMessages(p.getNotifyDiscussionMessages());
        dto.setEmailDigestFrequency(p.getEmailDigestFrequency());
        dto.setAlertEmail(p.getAlertEmail());

        try {
            if (p.getPreferredSectorsJson() != null && !p.getPreferredSectorsJson().isBlank()) {
                dto.setPreferredSectors(mapper.readValue(p.getPreferredSectorsJson(), new TypeReference<List<String>>() {}));
            } else {
                dto.setPreferredSectors(List.of("AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION"));
            }
        } catch (Exception e) {
            dto.setPreferredSectors(List.of("AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION"));
        }

        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIndustryProfileId() { return industryProfileId; }
    public void setIndustryProfileId(Long industryProfileId) { this.industryProfileId = industryProfileId; }

    public List<String> getPreferredSectors() { return preferredSectors != null ? preferredSectors : Collections.emptyList(); }
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
