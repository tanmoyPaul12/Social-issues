package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.ApprovalStage;
import com.example.social_issues.projectlifecycle.model.ApprovalStatus;
import com.example.social_issues.projectlifecycle.model.ApproverRole;
import com.example.social_issues.projectlifecycle.model.StageApprovalSignoff;

import java.time.LocalDateTime;

public class ApprovalSignoffDto {

    private Long id;
    private Long projectId;
    private ApprovalStage stage;
    private ApproverRole approverRole;
    private Long approverUserId;
    private String approverName;
    private ApprovalStatus approvalStatus;
    private String remarks;
    private String digitalSignatureHash;
    private Integer citizenRating;
    private String closureCertificateStorageKey;
    private String closureCertificateUrl;
    private LocalDateTime signedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApprovalSignoffDto() {}

    public static ApprovalSignoffDto fromEntity(StageApprovalSignoff entity) {
        if (entity == null) return null;
        ApprovalSignoffDto dto = new ApprovalSignoffDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setStage(entity.getStage());
        dto.setApproverRole(entity.getApproverRole());
        dto.setApproverUserId(entity.getApproverUserId());
        dto.setApproverName(entity.getApproverName());
        dto.setApprovalStatus(entity.getApprovalStatus());
        dto.setRemarks(entity.getRemarks());
        dto.setDigitalSignatureHash(entity.getDigitalSignatureHash());
        dto.setCitizenRating(entity.getCitizenRating());
        dto.setClosureCertificateStorageKey(entity.getClosureCertificateStorageKey());
        dto.setClosureCertificateUrl(entity.getClosureCertificateUrl());
        dto.setSignedAt(entity.getSignedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

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
