package com.example.social_issues.industrypartnership.dto;

import jakarta.validation.constraints.NotBlank;

public class PostDiscussionRequest {

    @NotBlank(message = "Message content cannot be blank")
    private String message;

    private String attachmentUrl;

    private String attachmentName;

    private String senderName;

    private String senderRole;

    public PostDiscussionRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
}
