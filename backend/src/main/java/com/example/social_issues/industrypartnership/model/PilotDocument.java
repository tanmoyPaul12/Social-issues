package com.example.social_issues.industrypartnership.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pilot_documents", indexes = {
    @Index(name = "idx_doc_pilot", columnList = "pilot_id"),
    @Index(name = "idx_doc_type", columnList = "doc_type")
})
public class PilotDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false)
    private CoFundedPilot pilot;

    @Column(name = "title", nullable = false, length = 250)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 60)
    private PilotDocumentType docType = PilotDocumentType.OTHER;

    @Column(name = "file_url", length = 500, nullable = false)
    private String fileUrl;

    @Column(name = "storage_key", length = 500)
    private String storageKey;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes = 0L;

    @Column(name = "mime_type", length = 120)
    private String mimeType;

    @Column(name = "uploaded_by_name", length = 150)
    private String uploadedByName;

    @Column(name = "uploaded_by_role", length = 80)
    private String uploadedByRole;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public PilotDocument() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CoFundedPilot getPilot() { return pilot; }
    public void setPilot(CoFundedPilot pilot) { this.pilot = pilot; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public PilotDocumentType getDocType() { return docType; }
    public void setDocType(PilotDocumentType docType) { this.docType = docType; }

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

    public String getUploadedByRole() { return uploadedByRole; }
    public void setUploadedByRole(String uploadedByRole) { this.uploadedByRole = uploadedByRole; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
