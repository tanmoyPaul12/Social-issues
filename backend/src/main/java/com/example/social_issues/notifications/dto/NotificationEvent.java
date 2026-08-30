package com.example.social_issues.notifications.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    private String severity; // "INFO", "ACTION_REQUIRED", "SUCCESS", "WARNING"
    private String actionUrl;
    private String referenceEntityType;
    private Long referenceEntityId;
    private List<String> channels;
    private Map<String, Object> statDeltas;
    private String timestamp;

    public NotificationEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = Instant.now().toString();
    }

    public NotificationEvent(String eventId, String eventType, String source, Long recipientUserId,
                             String recipientUserType, String recipientEmail, String recipientPhone,
                             String title, String message, String severity, String actionUrl,
                             String referenceEntityType, Long referenceEntityId, List<String> channels,
                             Map<String, Object> statDeltas, String timestamp) {
        this.eventId = eventId != null ? eventId : UUID.randomUUID().toString();
        this.eventType = eventType;
        this.source = source;
        this.recipientUserId = recipientUserId;
        this.recipientUserType = recipientUserType;
        this.recipientEmail = recipientEmail;
        this.recipientPhone = recipientPhone;
        this.title = title;
        this.message = message;
        this.severity = severity;
        this.actionUrl = actionUrl;
        this.referenceEntityType = referenceEntityType;
        this.referenceEntityId = referenceEntityId;
        this.channels = channels;
        this.statDeltas = statDeltas;
        this.timestamp = timestamp != null ? timestamp : Instant.now().toString();
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Long getRecipientUserId() {
        return recipientUserId;
    }

    public void setRecipientUserId(Long recipientUserId) {
        this.recipientUserId = recipientUserId;
    }

    public String getRecipientUserType() {
        return recipientUserType;
    }

    public void setRecipientUserType(String recipientUserType) {
        this.recipientUserType = recipientUserType;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getRecipientPhone() {
        return recipientPhone;
    }

    public void setRecipientPhone(String recipientPhone) {
        this.recipientPhone = recipientPhone;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public String getReferenceEntityType() {
        return referenceEntityType;
    }

    public void setReferenceEntityType(String referenceEntityType) {
        this.referenceEntityType = referenceEntityType;
    }

    public Long getReferenceEntityId() {
        return referenceEntityId;
    }

    public void setReferenceEntityId(Long referenceEntityId) {
        this.referenceEntityId = referenceEntityId;
    }

    public List<String> getChannels() {
        return channels;
    }

    public void setChannels(List<String> channels) {
        this.channels = channels;
    }

    public Map<String, Object> getStatDeltas() {
        return statDeltas;
    }

    public void setStatDeltas(Map<String, Object> statDeltas) {
        this.statDeltas = statDeltas;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
