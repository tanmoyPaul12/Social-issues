package com.example.social_issues.industryproposal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proposal_documents", indexes = {
    @Index(name = "idx_prop_doc_prop_id", columnList = "proposal_id")
})
public class ProposalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id", nullable = false)
    private IndustryProposal proposal;

    @Column(name = "title", nullable = false, length = 250)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 50)
    private ProposalDocType docType = ProposalDocType.PROPOSAL_MAIN;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "mime_type", length = 120)
    private String mimeType;

    @Column(name = "uploaded_by_name", length = 150)
    private String uploadedByName;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public ProposalDocument() {}

    @PrePersist
    public void prePersist() {
        if (this.uploadedAt == null) {
            this.uploadedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProposal getProposal() { return proposal; }
    public void setProposal(IndustryProposal proposal) { this.proposal = proposal; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ProposalDocType getDocType() { return docType; }
    public void setDocType(ProposalDocType docType) { this.docType = docType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
