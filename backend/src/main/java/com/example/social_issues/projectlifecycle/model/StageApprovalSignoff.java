package com.example.social_issues.projectlifecycle.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stage_approval_signoffs", indexes = {
    @Index(name = "idx_signoff_project_id", columnList = "project_id"),
    @Index(name = "idx_signoff_stage", columnList = "stage"),
    @Index(name = "idx_signoff_role", columnList = "approver_role"),
    @Index(name = "idx_signoff_status", columnList = "approval_status")
})
public class StageApprovalSignoff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 50)
    private ApprovalStage stage = ApprovalStage.FINAL_RESOLUTION;

    @Enumerated(EnumType.STRING)
    @Column(name = "approver_role", nullable = false, length = 50)
    private ApproverRole approverRole;

    @Column(name = "approver_user_id")
    private Long approverUserId;

    @Column(name = "approver_name", length = 150)
    private String approverName;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 50)
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "digital_signature_hash", length = 255)
    private String digitalSignatureHash;

    @Column(name = "citizen_rating")
    private Integer citizenRating; // 1 to 5 stars

    @Column(name = "closure_certificate_storage_key", length = 255)
    private String closureCertificateStorageKey;

    @Column(name = "closure_certificate_url", length = 500)
    private String closureCertificateUrl;

    @Column(name = "signed_at", nullable = false)
    private LocalDateTime signedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public StageApprovalSignoff() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public ApprovalStage getStage() { return stage; }
    public void setStage(ApprovalStage stage) { this.stage = stage; }

    public ApproverRole getApproverRole() { return approverRole; }
    public void setApproverRole(ApproverRole approverRole) { this.approverRole = approverRole; }

    public Long getApproverUserId() { return approverUserId; }
    public void setApproverUserId(Long approverUserId) { this.approverUserId = approverUserId; }

    public String getApproverName() { return approverName; }
    public void setApproverName(String approverName) { this.approverName = approverName; }

    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getDigitalSignatureHash() { return digitalSignatureHash; }
    public void setDigitalSignatureHash(String digitalSignatureHash) { this.digitalSignatureHash = digitalSignatureHash; }

    public Integer getCitizenRating() { return citizenRating; }
    public void setCitizenRating(Integer citizenRating) { this.citizenRating = citizenRating; }

    public String getClosureCertificateStorageKey() { return closureCertificateStorageKey; }
    public void setClosureCertificateStorageKey(String closureCertificateStorageKey) { this.closureCertificateStorageKey = closureCertificateStorageKey; }

    public String getClosureCertificateUrl() { return closureCertificateUrl; }
    public void setClosureCertificateUrl(String closureCertificateUrl) { this.closureCertificateUrl = closureCertificateUrl; }

    public LocalDateTime getSignedAt() { return signedAt; }
    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
