package com.example.social_issues.industryproposal.dto;

import com.example.social_issues.industryproposal.model.ProposalDocType;
import java.time.LocalDateTime;

public class ProposalDocumentResponse {

    private Long id;
    private Long proposalId;
    private String title;
    private ProposalDocType docType;
    private String fileUrl;
    private Long fileSizeBytes;
    private String mimeType;
    private String uploadedByName;
    private LocalDateTime uploadedAt;

    public ProposalDocumentResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProposalId() { return proposalId; }
    public void setProposalId(Long proposalId) { this.proposalId = proposalId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ProposalDocType getDocType() { return docType; }
    public void setDocType(ProposalDocType docType) { this.docType = docType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
