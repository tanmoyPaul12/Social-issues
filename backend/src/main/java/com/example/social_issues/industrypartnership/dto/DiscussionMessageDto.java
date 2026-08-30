package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.PilotDiscussion;
import java.time.LocalDateTime;

public class DiscussionMessageDto {

    private Long id;
    private Long pilotId;
    private Long senderUserId;
    private String senderName;
    private String senderRole;
    private String message;
    private String attachmentUrl;
    private String attachmentName;
    private Boolean isPinned;
    private LocalDateTime createdAt;

    public DiscussionMessageDto() {}

    public static DiscussionMessageDto fromEntity(PilotDiscussion entity) {
        if (entity == null) return null;
        DiscussionMessageDto dto = new DiscussionMessageDto();
        dto.setId(entity.getId());
        dto.setPilotId(entity.getPilot() != null ? entity.getPilot().getId() : null);
        dto.setSenderUserId(entity.getSenderUserId());
        dto.setSenderName(entity.getSenderName());
        dto.setSenderRole(entity.getSenderRole());
        dto.setMessage(entity.getMessage());
        dto.setAttachmentUrl(entity.getAttachmentUrl());
        dto.setAttachmentName(entity.getAttachmentName());
        dto.setIsPinned(entity.getIsPinned() != null ? entity.getIsPinned() : false);
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public Long getSenderUserId() { return senderUserId; }
    public void setSenderUserId(Long senderUserId) { this.senderUserId = senderUserId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public Boolean getIsPinned() { return isPinned; }
    public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
