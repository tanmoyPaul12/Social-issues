package com.example.social_issues.industrypartnership.dto;

import java.time.LocalDateTime;

public class LogMentorshipSessionRequest {

    private String sessionNotes;
    private LocalDateTime nextSessionDate;
    private String meetingLink;
    private Integer durationMinutes;

    public LogMentorshipSessionRequest() {}

    public String getSessionNotes() { return sessionNotes; }
    public void setSessionNotes(String sessionNotes) { this.sessionNotes = sessionNotes; }

    public LocalDateTime getNextSessionDate() { return nextSessionDate; }
    public void setNextSessionDate(LocalDateTime nextSessionDate) { this.nextSessionDate = nextSessionDate; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
}
