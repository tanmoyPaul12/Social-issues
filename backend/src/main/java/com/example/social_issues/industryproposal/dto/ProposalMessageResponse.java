package com.example.social_issues.industryproposal.dto;

import java.time.LocalDateTime;

public class ProposalMessageResponse {

    private Long id;
    private String threadRefId;
    private Long senderUserId;
    private String senderName;
    private String senderRole;
    private String message;
    private String attachmentUrl;
    private String attachmentName;
    private LocalDateTime createdAt;

    public ProposalMessageResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getThreadRefId() { return threadRefId; }
    public void setThreadRefId(String threadRefId) { this.threadRefId = threadRefId; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
