package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "corporate_notification_preferences")
public class CorporateNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false, unique = true)
    private IndustryProfile industryProfile;

    @Column(name = "preferred_sectors_json", length = 1000)
    private String preferredSectorsJson = "[\"AGRICULTURE\",\"WATER\",\"ENVIRONMENT\",\"EDUCATION\"]";

    @Column(name = "min_readiness_level", length = 50)
    private String minReadinessLevel = "PROTOTYPING";

    @Column(name = "notify_new_matching_projects")
    private Boolean notifyNewMatchingProjects = true;

    @Column(name = "notify_milestone_submissions")
    private Boolean notifyMilestoneSubmissions = true;

    @Column(name = "notify_disbursement_tranche_due")
    private Boolean notifyDisbursementTrancheDue = true;

    @Column(name = "notify_compliance_deadlines")
    private Boolean notifyComplianceDeadlines = true;

    @Column(name = "notify_discussion_messages")
    private Boolean notifyDiscussionMessages = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "email_digest_frequency", length = 30)
    private EmailDigestFrequency emailDigestFrequency = EmailDigestFrequency.INSTANT;

    @Column(name = "alert_email", length = 150)
    private String alertEmail;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public CorporateNotificationPreference() {}

    public CorporateNotificationPreference(IndustryProfile industryProfile) {
        this.industryProfile = industryProfile;
        this.alertEmail = industryProfile.getContactEmail() != null
                ? industryProfile.getContactEmail()
                : (industryProfile.getUser() != null ? industryProfile.getUser().getEmail() : null);
        this.preferredSectorsJson = industryProfile.getSectors() != null && !industryProfile.getSectors().isBlank()
                ? "[\"" + industryProfile.getSectors().replace(",", "\",\"").replace(" ", "") + "\"]"
                : "[\"AGRICULTURE\",\"WATER\",\"ENVIRONMENT\",\"EDUCATION\"]";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public String getPreferredSectorsJson() { return preferredSectorsJson; }
    public void setPreferredSectorsJson(String preferredSectorsJson) { this.preferredSectorsJson = preferredSectorsJson; }

    public String getMinReadinessLevel() { return minReadinessLevel; }
    public void setMinReadinessLevel(String minReadinessLevel) { this.minReadinessLevel = minReadinessLevel; }

    public Boolean getNotifyNewMatchingProjects() { return notifyNewMatchingProjects != null ? notifyNewMatchingProjects : true; }
    public void setNotifyNewMatchingProjects(Boolean notifyNewMatchingProjects) { this.notifyNewMatchingProjects = notifyNewMatchingProjects; }

    public Boolean getNotifyMilestoneSubmissions() { return notifyMilestoneSubmissions != null ? notifyMilestoneSubmissions : true; }
    public void setNotifyMilestoneSubmissions(Boolean notifyMilestoneSubmissions) { this.notifyMilestoneSubmissions = notifyMilestoneSubmissions; }

    public Boolean getNotifyDisbursementTrancheDue() { return notifyDisbursementTrancheDue != null ? notifyDisbursementTrancheDue : true; }
    public void setNotifyDisbursementTrancheDue(Boolean notifyDisbursementTrancheDue) { this.notifyDisbursementTrancheDue = notifyDisbursementTrancheDue; }

    public Boolean getNotifyComplianceDeadlines() { return notifyComplianceDeadlines != null ? notifyComplianceDeadlines : true; }
    public void setNotifyComplianceDeadlines(Boolean notifyComplianceDeadlines) { this.notifyComplianceDeadlines = notifyComplianceDeadlines; }

    public Boolean getNotifyDiscussionMessages() { return notifyDiscussionMessages != null ? notifyDiscussionMessages : true; }
    public void setNotifyDiscussionMessages(Boolean notifyDiscussionMessages) { this.notifyDiscussionMessages = notifyDiscussionMessages; }

    public EmailDigestFrequency getEmailDigestFrequency() { return emailDigestFrequency != null ? emailDigestFrequency : EmailDigestFrequency.INSTANT; }
    public void setEmailDigestFrequency(EmailDigestFrequency emailDigestFrequency) { this.emailDigestFrequency = emailDigestFrequency; }

    public String getAlertEmail() { return alertEmail; }
    public void setAlertEmail(String alertEmail) { this.alertEmail = alertEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
