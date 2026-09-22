package com.example.social_issues.industryproposal.model;

import com.example.social_issues.auth.model.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "industry_proposals", indexes = {
    @Index(name = "idx_prop_pub_id", columnList = "publication_id"),
    @Index(name = "idx_prop_ind_user_id", columnList = "industry_user_id"),
    @Index(name = "idx_prop_status", columnList = "status"),
    @Index(name = "idx_prop_thread_ref", columnList = "thread_ref_id")
})
public class IndustryProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publication_id", nullable = false)
    private IssuePublicationRecord publication;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_user_id", nullable = false)
    private User industryUser;

    @Column(name = "company_name", nullable = false, length = 250)
    private String companyName;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "proposal_title", nullable = false, length = 300)
    private String proposalTitle;

    @Column(name = "proposal_summary", nullable = false, columnDefinition = "TEXT")
    private String proposalSummary;

    @Column(name = "proposed_budget", precision = 15, scale = 2)
    private BigDecimal proposedBudget;

    @Column(name = "proposed_timeline_weeks")
    private Integer proposedTimelineWeeks;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ProposalStatus status = ProposalStatus.PENDING;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "thread_ref_id", length = 100)
    private String threadRefId;

    @OneToMany(mappedBy = "proposal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProposalDocument> documents = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public IndustryProposal() {}

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.submittedAt == null) this.submittedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IssuePublicationRecord getPublication() { return publication; }
    public void setPublication(IssuePublicationRecord publication) { this.publication = publication; }

    public User getIndustryUser() { return industryUser; }
    public void setIndustryUser(User industryUser) { this.industryUser = industryUser; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getProposalTitle() { return proposalTitle; }
    public void setProposalTitle(String proposalTitle) { this.proposalTitle = proposalTitle; }

    public String getProposalSummary() { return proposalSummary; }
    public void setProposalSummary(String proposalSummary) { this.proposalSummary = proposalSummary; }

    public BigDecimal getProposedBudget() { return proposedBudget; }
    public void setProposedBudget(BigDecimal proposedBudget) { this.proposedBudget = proposedBudget; }

    public Integer getProposedTimelineWeeks() { return proposedTimelineWeeks; }
    public void setProposedTimelineWeeks(Integer proposedTimelineWeeks) { this.proposedTimelineWeeks = proposedTimelineWeeks; }

    public ProposalStatus getStatus() { return status; }
    public void setStatus(ProposalStatus status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public Long getReviewedByUserId() { return reviewedByUserId; }
    public void setReviewedByUserId(Long reviewedByUserId) { this.reviewedByUserId = reviewedByUserId; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public String getThreadRefId() { return threadRefId; }
    public void setThreadRefId(String threadRefId) { this.threadRefId = threadRefId; }

    public List<ProposalDocument> getDocuments() { return documents; }
    public void setDocuments(List<ProposalDocument> documents) { this.documents = documents; }

    public void addDocument(ProposalDocument document) {
        documents.add(document);
        document.setProposal(this);
    }

    public void removeDocument(ProposalDocument document) {
        documents.remove(document);
        document.setProposal(null);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
