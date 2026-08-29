package com.example.social_issues.problemsubmission.dto;

import com.example.social_issues.problemsubmission.model.AttachmentType;
import com.example.social_issues.problemsubmission.model.IssueAttachment;
import java.time.LocalDateTime;

public class AttachmentResponse {

    private Long id;
    private String fileUrl;
    private String fileName;
    private AttachmentType fileType;
    private String mimeType;
    private Long fileSizeBytes;
    private LocalDateTime uploadedAt;

    public AttachmentResponse() {}

    public static AttachmentResponse fromEntity(IssueAttachment attachment) {
        if (attachment == null) return null;
        AttachmentResponse res = new AttachmentResponse();
        res.setId(attachment.getId());
        res.setFileUrl(attachment.getFileUrl());
        res.setFileName(attachment.getFileName());
        res.setFileType(attachment.getFileType());
        res.setMimeType(attachment.getMimeType());
        res.setFileSizeBytes(attachment.getFileSizeBytes());
        res.setUploadedAt(attachment.getUploadedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public AttachmentType getFileType() { return fileType; }
    public void setFileType(AttachmentType fileType) { this.fileType = fileType; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
