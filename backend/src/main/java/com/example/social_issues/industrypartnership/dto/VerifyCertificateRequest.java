package com.example.social_issues.industrypartnership.dto;

import jakarta.validation.constraints.NotNull;

public class VerifyCertificateRequest {

    @NotNull(message = "Verification status flag is required")
    private Boolean verified;

    private String remarks;

    public VerifyCertificateRequest() {}

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
