package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.DeploymentStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class UpdateTestbedStatusRequest {

    @NotNull(message = "Deployment status is required")
    private DeploymentStatus status;

    private Integer beneficiaryCount;
    private Long beneficiariesImpacted;
    private String liveDataFeedUrl;
    private LocalDate completedAt;
    private String notes;

    public UpdateTestbedStatusRequest() {}

    public DeploymentStatus getStatus() { return status; }
    public void setStatus(DeploymentStatus status) { this.status = status; }

    public Integer getBeneficiaryCount() { return beneficiaryCount; }
    public void setBeneficiaryCount(Integer beneficiaryCount) { this.beneficiaryCount = beneficiaryCount; }

    public Long getBeneficiariesImpacted() { return beneficiariesImpacted; }
    public void setBeneficiariesImpacted(Long beneficiariesImpacted) { this.beneficiariesImpacted = beneficiariesImpacted; }

    public String getLiveDataFeedUrl() { return liveDataFeedUrl; }
    public void setLiveDataFeedUrl(String liveDataFeedUrl) { this.liveDataFeedUrl = liveDataFeedUrl; }

    public LocalDate getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDate completedAt) { this.completedAt = completedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
