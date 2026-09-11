package com.example.social_issues.projectlifecycle.dto;

import java.time.LocalDateTime;

public class DualClosedLoopStatusDto {

    private Long projectId;
    private boolean citizenSignedOff;
    private Integer citizenRating;
    private String citizenRemarks;
    private LocalDateTime citizenSignedAt;

    private boolean nodalOfficerSignedOff;
    private String nodalOfficerName;
    private String closureCertificateUrl;
    private LocalDateTime nodalOfficerSignedAt;

    private boolean isFullyClosedAndResolved;

    public DualClosedLoopStatusDto() {}

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public boolean isCitizenSignedOff() { return citizenSignedOff; }
    public void setCitizenSignedOff(boolean citizenSignedOff) { this.citizenSignedOff = citizenSignedOff; }

    public Integer getCitizenRating() { return citizenRating; }
    public void setCitizenRating(Integer citizenRating) { this.citizenRating = citizenRating; }

    public String getCitizenRemarks() { return citizenRemarks; }
    public void setCitizenRemarks(String citizenRemarks) { this.citizenRemarks = citizenRemarks; }

    public LocalDateTime getCitizenSignedAt() { return citizenSignedAt; }
    public void setCitizenSignedAt(LocalDateTime citizenSignedAt) { this.citizenSignedAt = citizenSignedAt; }

    public boolean isNodalOfficerSignedOff() { return nodalOfficerSignedOff; }
    public void setNodalOfficerSignedOff(boolean nodalOfficerSignedOff) { this.nodalOfficerSignedOff = nodalOfficerSignedOff; }

    public String getNodalOfficerName() { return nodalOfficerName; }
    public void setNodalOfficerName(String nodalOfficerName) { this.nodalOfficerName = nodalOfficerName; }

    public String getClosureCertificateUrl() { return closureCertificateUrl; }
    public void setClosureCertificateUrl(String closureCertificateUrl) { this.closureCertificateUrl = closureCertificateUrl; }

    public LocalDateTime getNodalOfficerSignedAt() { return nodalOfficerSignedAt; }
    public void setNodalOfficerSignedAt(LocalDateTime nodalOfficerSignedAt) { this.nodalOfficerSignedAt = nodalOfficerSignedAt; }

    public boolean isFullyClosedAndResolved() { return isFullyClosedAndResolved; }
    public void setFullyClosedAndResolved(boolean fullyClosedAndResolved) { isFullyClosedAndResolved = fullyClosedAndResolved; }
}
