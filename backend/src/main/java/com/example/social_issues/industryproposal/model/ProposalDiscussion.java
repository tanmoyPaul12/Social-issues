package com.example.social_issues.industryproposal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proposal_discussions", indexes = {
    @Index(name = "idx_prop_disc_thread_ref", columnList = "thread_ref_id, created_at"),
    @Index(name = "idx_prop_disc_proposal_id", columnList = "proposal_id")
})
public class ProposalDiscussion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "thread_ref_id", nullable = false, length = 100)
    private String threadRefId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id", nullable = false)
    private IndustryProposal proposal;

    @Column(name = "sender_user_id", nullable = false)
    private Long senderUserId;

    @Column(name = "sender_name", nullable = false, length = 150)
    private String senderName;

    @Column(name = "sender_role", nullable = false, length = 50)
    private String senderRole;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "attachment_name", length = 200)
    private String attachmentName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ProposalDiscussion() {}

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getThreadRefId() { return threadRefId; }
    public void setThreadRefId(String threadRefId) { this.threadRefId = threadRefId; }

    public IndustryProposal getProposal() { return proposal; }
    public void setProposal(IndustryProposal proposal) { this.proposal = proposal; }

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
