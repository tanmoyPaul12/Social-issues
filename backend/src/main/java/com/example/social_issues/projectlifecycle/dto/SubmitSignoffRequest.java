package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.ApprovalStage;
import com.example.social_issues.projectlifecycle.model.ApprovalStatus;
import com.example.social_issues.projectlifecycle.model.ApproverRole;
import jakarta.validation.constraints.NotNull;

public class SubmitSignoffRequest {

    @NotNull(message = "Stage is required")
    private ApprovalStage stage = ApprovalStage.FINAL_RESOLUTION;

    @NotNull(message = "Approver role is required")
    private ApproverRole approverRole;

    private String approverName;

    @NotNull(message = "Approval status is required")
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    private String remarks;

    private Integer citizenRating; // Optional: 1-5 stars if citizen role

    private String closureCertificateStorageKey; // Optional: PDF key if nodal officer role
    private String closureCertificateUrl;

    public SubmitSignoffRequest() {}

    public ApprovalStage getStage() { return stage; }
    public void setStage(ApprovalStage stage) { this.stage = stage; }

    public ApproverRole getApproverRole() { return approverRole; }
    public void setApproverRole(ApproverRole approverRole) { this.approverRole = approverRole; }

    public String getApproverName() { return approverName; }
    public void setApproverName(String approverName) { this.approverName = approverName; }

    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Integer getCitizenRating() { return citizenRating; }
    public void setCitizenRating(Integer citizenRating) { this.citizenRating = citizenRating; }

    public String getClosureCertificateStorageKey() { return closureCertificateStorageKey; }
    public void setClosureCertificateStorageKey(String closureCertificateStorageKey) { this.closureCertificateStorageKey = closureCertificateStorageKey; }

    public String getClosureCertificateUrl() { return closureCertificateUrl; }
    public void setClosureCertificateUrl(String closureCertificateUrl) { this.closureCertificateUrl = closureCertificateUrl; }
}
