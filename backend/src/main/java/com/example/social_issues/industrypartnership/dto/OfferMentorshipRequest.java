package com.example.social_issues.industrypartnership.dto;

import jakarta.validation.constraints.NotBlank;

public class OfferMentorshipRequest {

    @NotBlank(message = "Mentor nominee name is required")
    private String mentorName;

    private String mentorDesignation;
    private String mentorEmail;
    private String domainExpertise;
    private Integer weeklyHoursCommitted = 2;
    private String messageNotes;

    public OfferMentorshipRequest() {}

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorDesignation() { return mentorDesignation; }
    public void setMentorDesignation(String mentorDesignation) { this.mentorDesignation = mentorDesignation; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public String getDomainExpertise() { return domainExpertise; }
    public void setDomainExpertise(String domainExpertise) { this.domainExpertise = domainExpertise; }

    public Integer getWeeklyHoursCommitted() { return weeklyHoursCommitted; }
    public void setWeeklyHoursCommitted(Integer weeklyHoursCommitted) { this.weeklyHoursCommitted = weeklyHoursCommitted; }

    public String getMessageNotes() { return messageNotes; }
    public void setMessageNotes(String messageNotes) { this.messageNotes = messageNotes; }
}
