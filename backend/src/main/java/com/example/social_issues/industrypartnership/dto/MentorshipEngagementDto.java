package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.MentorshipEngagement;
import com.example.social_issues.industrypartnership.model.MentorshipStatus;

import java.time.LocalDateTime;

public class MentorshipEngagementDto {

    private Long id;
    private Long marketplaceProjectId;
    private String projectTitle;
    private String domain;
    private String universityName;
    private String mentorName;
    private String mentorDesignation;
    private String mentorEmail;
    private String mentorPhone;
    private String expertiseDomains;
    private MentorshipStatus status;
    private Integer sessionCount;
    private LocalDateTime nextSessionDate;
    private String meetingLink;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MentorshipEngagementDto() {}

    public static MentorshipEngagementDto fromEntity(MentorshipEngagement entity) {
        MentorshipEngagementDto dto = new MentorshipEngagementDto();
        dto.setId(entity.getId());
        if (entity.getMarketplaceProject() != null) {
            dto.setMarketplaceProjectId(entity.getMarketplaceProject().getId());
            dto.setProjectTitle(entity.getMarketplaceProject().getTitle());
            dto.setDomain(entity.getMarketplaceProject().getSector() != null ? entity.getMarketplaceProject().getSector().name() : null);
            dto.setUniversityName(entity.getMarketplaceProject().getUniversityName());
        }
        dto.setMentorName(entity.getMentorName());
        dto.setMentorDesignation(entity.getMentorDesignation());
        dto.setMentorEmail(entity.getMentorEmail());
        dto.setMentorPhone(entity.getMentorPhone());
        dto.setExpertiseDomains(entity.getExpertiseDomains());
        dto.setStatus(entity.getStatus());
        dto.setSessionCount(entity.getSessionCount() != null ? entity.getSessionCount() : 0);
        dto.setNextSessionDate(entity.getNextSessionDate());
        dto.setMeetingLink(entity.getMeetingLink());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMarketplaceProjectId() { return marketplaceProjectId; }
    public void setMarketplaceProjectId(Long marketplaceProjectId) { this.marketplaceProjectId = marketplaceProjectId; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

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
