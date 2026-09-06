package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.PilotHealthStatus;
import jakarta.validation.constraints.NotNull;

public class UpdatePilotHealthRequest {

    @NotNull(message = "Health status is required")
    private PilotHealthStatus healthStatus;

    public UpdatePilotHealthRequest() {}

    public PilotHealthStatus getHealthStatus() { return healthStatus; }
    public void setHealthStatus(PilotHealthStatus healthStatus) { this.healthStatus = healthStatus; }
}
