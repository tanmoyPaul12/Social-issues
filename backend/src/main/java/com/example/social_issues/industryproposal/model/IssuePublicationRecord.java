package com.example.social_issues.industryproposal.model;

import com.example.social_issues.auth.model.User;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "issue_publication_records", indexes = {
    @Index(name = "idx_pub_issue_id", columnList = "issue_id"),
    @Index(name = "idx_pub_is_published", columnList = "is_published_to_industry"),
    @Index(name = "idx_pub_published_at", columnList = "published_at")
})
public class IssuePublicationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private GrassrootIssue issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by_user_id", nullable = false)
    private User publishedByUser;

    @Column(name = "published_by_name", length = 150)
    private String publishedByName;

    @Column(name = "published_by_role", length = 50)
    private String publishedByRole;

    @Column(name = "is_published_to_industry", nullable = false)
    private Boolean isPublishedToIndustry = true;

    @Column(name = "published_at", nullable = false)
    private LocalDateTime publishedAt = LocalDateTime.now();

    @Column(name = "generated_pdf_url", length = 500)
    private String generatedPdfUrl;

    @Column(name = "generated_pdf_storage_key", length = 500)
    private String generatedPdfStorageKey;

    @Column(name = "pdf_generated_at")
    private LocalDateTime pdfGeneratedAt;

    @Column(name = "college_custom_notes", columnDefinition = "TEXT")
    private String collegeCustomNotes;

    @Column(name = "college_guideline_doc_url", length = 500)
    private String collegeGuidelineDocUrl;

    @Column(name = "college_guideline_doc_name", length = 250)
    private String collegeGuidelineDocName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public IssuePublicationRecord() {}

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.publishedAt == null) this.publishedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public GrassrootIssue getIssue() { return issue; }
    public void setIssue(GrassrootIssue issue) { this.issue = issue; }

    public User getPublishedByUser() { return publishedByUser; }
    public void setPublishedByUser(User publishedByUser) { this.publishedByUser = publishedByUser; }

    public String getPublishedByName() { return publishedByName; }
    public void setPublishedByName(String publishedByName) { this.publishedByName = publishedByName; }

    public String getPublishedByRole() { return publishedByRole; }
    public void setPublishedByRole(String publishedByRole) { this.publishedByRole = publishedByRole; }

    public Boolean getIsPublishedToIndustry() { return isPublishedToIndustry; }
    public void setIsPublishedToIndustry(Boolean isPublishedToIndustry) { this.isPublishedToIndustry = isPublishedToIndustry; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    public String getGeneratedPdfUrl() { return generatedPdfUrl; }
    public void setGeneratedPdfUrl(String generatedPdfUrl) { this.generatedPdfUrl = generatedPdfUrl; }

    public String getGeneratedPdfStorageKey() { return generatedPdfStorageKey; }
    public void setGeneratedPdfStorageKey(String generatedPdfStorageKey) { this.generatedPdfStorageKey = generatedPdfStorageKey; }

    public LocalDateTime getPdfGeneratedAt() { return pdfGeneratedAt; }
    public void setPdfGeneratedAt(LocalDateTime pdfGeneratedAt) { this.pdfGeneratedAt = pdfGeneratedAt; }

    public String getCollegeCustomNotes() { return collegeCustomNotes; }
    public void setCollegeCustomNotes(String collegeCustomNotes) { this.collegeCustomNotes = collegeCustomNotes; }

    public String getCollegeGuidelineDocUrl() { return collegeGuidelineDocUrl; }
    public void setCollegeGuidelineDocUrl(String collegeGuidelineDocUrl) { this.collegeGuidelineDocUrl = collegeGuidelineDocUrl; }

    public String getCollegeGuidelineDocName() { return collegeGuidelineDocName; }
    public void setCollegeGuidelineDocName(String collegeGuidelineDocName) { this.collegeGuidelineDocName = collegeGuidelineDocName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
