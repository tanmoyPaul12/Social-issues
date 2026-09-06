package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.PilotDocument;
import com.example.social_issues.industrypartnership.model.PilotDocumentType;
import java.time.LocalDateTime;

public class PilotDocumentDto {

    private Long id;
    private Long pilotId;
    private String title;
    private PilotDocumentType docType;
    private String docTypeLabel;
    private String fileUrl;
    private Long fileSizeBytes;
    private String fileSizeFormatted;
    private String mimeType;
    private String uploadedByName;
    private String uploadedByRole;
    private LocalDateTime uploadedAt;

    public PilotDocumentDto() {}

    public static PilotDocumentDto fromEntity(PilotDocument entity) {
        if (entity == null) return null;
        PilotDocumentDto dto = new PilotDocumentDto();
        dto.setId(entity.getId());
        dto.setPilotId(entity.getPilot() != null ? entity.getPilot().getId() : null);
        dto.setTitle(entity.getTitle());
        dto.setDocType(entity.getDocType());
        dto.setDocTypeLabel(formatDocTypeLabel(entity.getDocType()));
        dto.setFileUrl(entity.getFileUrl());
        dto.setFileSizeBytes(entity.getFileSizeBytes() != null ? entity.getFileSizeBytes() : 0L);
        dto.setFileSizeFormatted(formatFileSize(entity.getFileSizeBytes()));
        dto.setMimeType(entity.getMimeType());
        dto.setUploadedByName(entity.getUploadedByName());
        dto.setUploadedByRole(entity.getUploadedByRole());
        dto.setUploadedAt(entity.getUploadedAt());
        return dto;
    }

    private static String formatDocTypeLabel(PilotDocumentType docType) {
        if (docType == null) return "Other";
        return switch (docType) {
            case PROJECT_PROPOSAL -> "Project Proposal";
            case MILESTONE_DELIVERABLE -> "Milestone Deliverable";
            case LAB_REPORT -> "Lab Test Report";
            case TESTBED_EVALUATION -> "Field Testbed Report";
            case UTILIZATION_CERTIFICATE -> "Utilization Certificate";
            case MOU_AGREEMENT -> "MoU & Grant Agreement";
            case OTHER -> "Document";
        };
    }

    private static String formatFileSize(Long bytes) {
        if (bytes == null || bytes <= 0) return "0 KB";
        if (bytes >= 1024 * 1024) {
            return String.format("%.1f MB", (double) bytes / (1024 * 1024));
        }
        return String.format("%d KB", bytes / 1024);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public PilotDocumentType getDocType() { return docType; }
    public void setDocType(PilotDocumentType docType) { this.docType = docType; }

    public String getDocTypeLabel() { return docTypeLabel; }
    public void setDocTypeLabel(String docTypeLabel) { this.docTypeLabel = docTypeLabel; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getFileSizeFormatted() { return fileSizeFormatted; }
    public void setFileSizeFormatted(String fileSizeFormatted) { this.fileSizeFormatted = fileSizeFormatted; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public String getUploadedByRole() { return uploadedByRole; }
    public void setUploadedByRole(String uploadedByRole) { this.uploadedByRole = uploadedByRole; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
