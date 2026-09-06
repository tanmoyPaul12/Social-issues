package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.ActivitySeverity;
import com.example.social_issues.industrypartnership.model.IndustryActivityLog;
import java.time.LocalDateTime;

public class IndustryActivityDto {

    private Long id;
    private String eventType;
    private String title;
    private String description;
    private String referenceEntityType;
    private Long referenceEntityId;
    private ActivitySeverity severity;
    private String relativeTime;
    private LocalDateTime timestamp;

    public IndustryActivityDto() {}

    public static IndustryActivityDto fromEntity(IndustryActivityLog log) {
        if (log == null) return null;
        IndustryActivityDto dto = new IndustryActivityDto();
        dto.setId(log.getId());
        dto.setEventType(log.getEventType());
        dto.setTitle(log.getTitle());
        dto.setDescription(log.getDescription());
        dto.setReferenceEntityType(log.getReferenceEntityType());
        dto.setReferenceEntityId(log.getReferenceEntityId());
        dto.setSeverity(log.getSeverity());
        dto.setTimestamp(log.getCreatedAt());
        dto.setRelativeTime("Recently");
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getReferenceEntityType() { return referenceEntityType; }
    public void setReferenceEntityType(String referenceEntityType) { this.referenceEntityType = referenceEntityType; }

    public Long getReferenceEntityId() { return referenceEntityId; }
    public void setReferenceEntityId(Long referenceEntityId) { this.referenceEntityId = referenceEntityId; }

    public ActivitySeverity getSeverity() { return severity; }
    public void setSeverity(ActivitySeverity severity) { this.severity = severity; }

    public String getRelativeTime() { return relativeTime; }
    public void setRelativeTime(String relativeTime) { this.relativeTime = relativeTime; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
