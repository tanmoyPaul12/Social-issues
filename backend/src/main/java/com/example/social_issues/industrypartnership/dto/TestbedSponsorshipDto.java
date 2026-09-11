package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.DeploymentStatus;
import com.example.social_issues.industrypartnership.model.TestbedSponsorship;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class TestbedSponsorshipDto {

    private Long id;
    private Long industryProfileId;
    private String industryCompanyName;
    private Long pilotId;
    private String pilotTitle;
    private String projectName;
    private String pilotPhase;
    private String testbedName;
    private String district;
    private String block;
    private String villageOrLocation;
    private Long beneficiariesImpacted;
    private Integer beneficiaryCount;
    private String status;
    private DeploymentStatus deploymentStatus;
    private String deploymentStatusLabel;
    private String evidencePhotoUrlsRaw;
    private List<String> evidencePhotoUrls;
    private String liveDataFeedUrl;
    private LocalDate startedAt;
    private LocalDate completedAt;
    private LocalDateTime createdAt;

    public TestbedSponsorshipDto() {}

    public static TestbedSponsorshipDto fromEntity(TestbedSponsorship entity) {
        if (entity == null) return null;

        TestbedSponsorshipDto dto = new TestbedSponsorshipDto();
        dto.setId(entity.getId());
        if (entity.getIndustryProfile() != null) {
            dto.setIndustryProfileId(entity.getIndustryProfile().getId());
            dto.setIndustryCompanyName(entity.getIndustryProfile().getCompanyName());
        }
        if (entity.getPilot() != null) {
            dto.setPilotId(entity.getPilot().getId());
            dto.setPilotTitle(entity.getPilot().getTitle());
        } else {
            dto.setPilotTitle(entity.getProjectName() != null ? entity.getProjectName() : entity.getTestbedName());
        }

        dto.setProjectName(entity.getProjectName());
        dto.setPilotPhase(entity.getPilotPhase() != null ? entity.getPilotPhase() : "Phase 1 - Field Validation");
        dto.setTestbedName(entity.getTestbedName());
        dto.setDistrict(entity.getDistrict());
        dto.setBlock(entity.getBlock() != null ? entity.getBlock() : "");
        dto.setVillageOrLocation(entity.getVillageOrLocation() != null ? entity.getVillageOrLocation() : "");
        
        dto.setBeneficiariesImpacted(entity.getBeneficiariesImpacted() != null ? entity.getBeneficiariesImpacted() : 0L);
        dto.setBeneficiaryCount(entity.getBeneficiaryCount() != null ? entity.getBeneficiaryCount() : (dto.getBeneficiariesImpacted() != null ? dto.getBeneficiariesImpacted().intValue() : 0));
        
        dto.setStatus(entity.getStatus() != null ? entity.getStatus() : "ACTIVE_TRIAL");
        dto.setDeploymentStatus(entity.getDeploymentStatus() != null ? entity.getDeploymentStatus() : DeploymentStatus.PLANNED);
        dto.setDeploymentStatusLabel(formatDeploymentStatus(dto.getDeploymentStatus()));

        dto.setEvidencePhotoUrlsRaw(entity.getEvidencePhotoUrls());
        dto.setEvidencePhotoUrls(parseEvidencePhotoUrls(entity.getEvidencePhotoUrls()));
        dto.setLiveDataFeedUrl(entity.getLiveDataFeedUrl());

        dto.setStartedAt(entity.getStartedAt());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }

    private static String formatDeploymentStatus(DeploymentStatus status) {
        if (status == null) return "Planned";
        return switch (status) {
            case PLANNED -> "Planned Deployment";
            case LIVE -> "Live Field Trial";
            case COMPLETED -> "Completed & Validated";
            case SUSPENDED -> "Temporarily Suspended";
        };
    }

    private static List<String> parseEvidencePhotoUrls(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        String cleaned = raw.trim();
        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
            cleaned = cleaned.substring(1, cleaned.length() - 1);
        }
        if (cleaned.isBlank()) return Collections.emptyList();
        return Arrays.stream(cleaned.split(","))
                .map(s -> s.trim().replaceAll("^\"|\"$", "").replaceAll("^'|'$", ""))
                .filter(s -> !s.isBlank())
                .toList();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIndustryProfileId() { return industryProfileId; }
    public void setIndustryProfileId(Long industryProfileId) { this.industryProfileId = industryProfileId; }

    public String getIndustryCompanyName() { return industryCompanyName; }
    public void setIndustryCompanyName(String industryCompanyName) { this.industryCompanyName = industryCompanyName; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public String getPilotTitle() { return pilotTitle; }
    public void setPilotTitle(String pilotTitle) { this.pilotTitle = pilotTitle; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getPilotPhase() { return pilotPhase; }
    public void setPilotPhase(String pilotPhase) { this.pilotPhase = pilotPhase; }

    public String getTestbedName() { return testbedName; }
    public void setTestbedName(String testbedName) { this.testbedName = testbedName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getVillageOrLocation() { return villageOrLocation; }
    public void setVillageOrLocation(String villageOrLocation) { this.villageOrLocation = villageOrLocation; }

    public Long getBeneficiariesImpacted() { return beneficiariesImpacted; }
    public void setBeneficiariesImpacted(Long beneficiariesImpacted) { this.beneficiariesImpacted = beneficiariesImpacted; }

    public Integer getBeneficiaryCount() { return beneficiaryCount; }
    public void setBeneficiaryCount(Integer beneficiaryCount) { this.beneficiaryCount = beneficiaryCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public DeploymentStatus getDeploymentStatus() { return deploymentStatus; }
    public void setDeploymentStatus(DeploymentStatus deploymentStatus) { this.deploymentStatus = deploymentStatus; }

    public String getDeploymentStatusLabel() { return deploymentStatusLabel; }
    public void setDeploymentStatusLabel(String deploymentStatusLabel) { this.deploymentStatusLabel = deploymentStatusLabel; }

    public String getEvidencePhotoUrlsRaw() { return evidencePhotoUrlsRaw; }
    public void setEvidencePhotoUrlsRaw(String evidencePhotoUrlsRaw) { this.evidencePhotoUrlsRaw = evidencePhotoUrlsRaw; }

    public List<String> getEvidencePhotoUrls() { return evidencePhotoUrls != null ? evidencePhotoUrls : Collections.emptyList(); }
    public void setEvidencePhotoUrls(List<String> evidencePhotoUrls) { this.evidencePhotoUrls = evidencePhotoUrls; }

    public String getLiveDataFeedUrl() { return liveDataFeedUrl; }
    public void setLiveDataFeedUrl(String liveDataFeedUrl) { this.liveDataFeedUrl = liveDataFeedUrl; }

    public LocalDate getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDate startedAt) { this.startedAt = startedAt; }

    public LocalDate getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDate completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
