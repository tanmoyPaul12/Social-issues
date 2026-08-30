package com.example.social_issues.notifications.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NotificationEvent {

    private String eventId;
    private String eventType;
    private String source;
    private Long recipientUserId;
    private String recipientUserType;
    private String recipientEmail;
    private String recipientPhone;

    private String title;
    private String message;
    private String severity = "INFO";
    private String actionUrl;
    private String referenceEntityType;
    private Long referenceEntityId;

    private List<String> channels = new ArrayList<>(List.of("IN_APP"));
    private Map<String, Object> statDeltas = new HashMap<>();
    private LocalDateTime timestamp = LocalDateTime.now();

    public NotificationEvent() {}

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }

    public String getRecipientUserType() { return recipientUserType; }
    public void setRecipientUserType(String recipientUserType) { this.recipientUserType = recipientUserType; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public String getReferenceEntityType() { return referenceEntityType; }
    public void setReferenceEntityType(String referenceEntityType) { this.referenceEntityType = referenceEntityType; }

    public Long getReferenceEntityId() { return referenceEntityId; }
    public void setReferenceEntityId(Long referenceEntityId) { this.referenceEntityId = referenceEntityId; }

    public List<String> getChannels() { return channels; }
    public void setChannels(List<String> channels) { this.channels = channels; }

    public Map<String, Object> getStatDeltas() { return statDeltas; }
    public void setStatDeltas(Map<String, Object> statDeltas) { this.statDeltas = statDeltas; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
