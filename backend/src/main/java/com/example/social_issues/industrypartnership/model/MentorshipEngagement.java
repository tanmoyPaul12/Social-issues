package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentorship_engagements")
public class MentorshipEngagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marketplace_project_id", nullable = false)
    private MarketplaceProject marketplaceProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @Column(name = "mentor_name", nullable = false)
    private String mentorName;

    @Column(name = "mentor_designation")
    private String mentorDesignation;

    @Column(name = "mentor_email", nullable = false)
    private String mentorEmail;

    @Column(name = "mentor_phone")
    private String mentorPhone;

    @Column(name = "expertise_domains")
    private String expertiseDomains;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MentorshipStatus status = MentorshipStatus.PENDING_ACCEPTANCE;

    @Column(name = "session_count", nullable = false)
    private Integer sessionCount = 0;

    @Column(name = "next_session_date")
    private LocalDateTime nextSessionDate;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MentorshipEngagement() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (sessionCount == null) sessionCount = 0;
        if (status == null) status = MentorshipStatus.PENDING_ACCEPTANCE;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MarketplaceProject getMarketplaceProject() { return marketplaceProject; }
    public void setMarketplaceProject(MarketplaceProject marketplaceProject) { this.marketplaceProject = marketplaceProject; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorDesignation() { return mentorDesignation; }
    public void setMentorDesignation(String mentorDesignation) { this.mentorDesignation = mentorDesignation; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public String getMentorPhone() { return mentorPhone; }
    public void setMentorPhone(String mentorPhone) { this.mentorPhone = mentorPhone; }

    public String getExpertiseDomains() { return expertiseDomains; }
    public void setExpertiseDomains(String expertiseDomains) { this.expertiseDomains = expertiseDomains; }

    public MentorshipStatus getStatus() { return status; }
    public void setStatus(MentorshipStatus status) { this.status = status; }

    public Integer getSessionCount() { return sessionCount; }
    public void setSessionCount(Integer sessionCount) { this.sessionCount = sessionCount; }

    public LocalDateTime getNextSessionDate() { return nextSessionDate; }
    public void setNextSessionDate(LocalDateTime nextSessionDate) { this.nextSessionDate = nextSessionDate; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
