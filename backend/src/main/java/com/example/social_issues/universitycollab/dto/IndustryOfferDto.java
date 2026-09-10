package com.example.social_issues.universitycollab.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class IndustryOfferDto {

    private Long id;
    private Long projectId;
    private String projectTitle;
    private String company;
    private String industryProfileName;
    private String engagementType;
    private BigDecimal offeredAmount;
    private String mentorName;
    private String mentorDesignation;
    private String mentorEmail;
    private String status;
    private String messageNotes;
    private LocalDateTime createdAt;

    public IndustryOfferDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getIndustryProfileName() { return industryProfileName; }
    public void setIndustryProfileName(String industryProfileName) { this.industryProfileName = industryProfileName; }

    public String getEngagementType() { return engagementType; }
    public void setEngagementType(String engagementType) { this.engagementType = engagementType; }

    public BigDecimal getOfferedAmount() { return offeredAmount; }
    public void setOfferedAmount(BigDecimal offeredAmount) { this.offeredAmount = offeredAmount; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorDesignation() { return mentorDesignation; }
    public void setMentorDesignation(String mentorDesignation) { this.mentorDesignation = mentorDesignation; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessageNotes() { return messageNotes; }
    public void setMessageNotes(String messageNotes) { this.messageNotes = messageNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
