package com.example.social_issues.industryproposal.dto;

import jakarta.validation.constraints.NotBlank;

public class ProposalMessageRequest {

    @NotBlank(message = "Message content is required")
    private String message;

    private String attachmentUrl;

    private String attachmentName;

    public ProposalMessageRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }
}
