package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.DeploymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class CreateTestbedRequest {

    @NotBlank(message = "Testbed site name is required")
    @Size(max = 200, message = "Testbed name must not exceed 200 characters")
    private String testbedName;

    @NotBlank(message = "District location is required")
    @Size(max = 100, message = "District name must not exceed 100 characters")
    private String district;

    @Size(max = 100, message = "Block name must not exceed 100 characters")
    private String block;

    @Size(max = 150, message = "Village / location must not exceed 150 characters")
    private String villageOrLocation;

    private Long pilotId;

    @Size(max = 250, message = "Project name must not exceed 250 characters")
    private String projectName;

    @Size(max = 80, message = "Pilot phase must not exceed 80 characters")
    private String pilotPhase;

    private Integer beneficiaryCount;
    private Long beneficiariesImpacted;

    private DeploymentStatus deploymentStatus = DeploymentStatus.PLANNED;

    @Size(max = 500, message = "Live data feed URL must not exceed 500 characters")
    private String liveDataFeedUrl;

    private LocalDate startedAt;
    private LocalDate completedAt;

    public CreateTestbedRequest() {}

    public String getTestbedName() { return testbedName; }
    public void setTestbedName(String testbedName) { this.testbedName = testbedName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getVillageOrLocation() { return villageOrLocation; }
    public void setVillageOrLocation(String villageOrLocation) { this.villageOrLocation = villageOrLocation; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getPilotPhase() { return pilotPhase; }
    public void setPilotPhase(String pilotPhase) { this.pilotPhase = pilotPhase; }

    public Integer getBeneficiaryCount() { return beneficiaryCount; }
    public void setBeneficiaryCount(Integer beneficiaryCount) { this.beneficiaryCount = beneficiaryCount; }

    public Long getBeneficiariesImpacted() { return beneficiariesImpacted; }
    public void setBeneficiariesImpacted(Long beneficiariesImpacted) { this.beneficiariesImpacted = beneficiariesImpacted; }

    public DeploymentStatus getDeploymentStatus() { return deploymentStatus; }
    public void setDeploymentStatus(DeploymentStatus deploymentStatus) { this.deploymentStatus = deploymentStatus; }

    public String getLiveDataFeedUrl() { return liveDataFeedUrl; }
    public void setLiveDataFeedUrl(String liveDataFeedUrl) { this.liveDataFeedUrl = liveDataFeedUrl; }

    public LocalDate getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDate startedAt) { this.startedAt = startedAt; }

    public LocalDate getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDate completedAt) { this.completedAt = completedAt; }
}
