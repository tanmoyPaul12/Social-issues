package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "testbed_sponsorships", indexes = {
    @Index(name = "idx_testbeds_industry_profile", columnList = "industry_profile_id"),
    @Index(name = "idx_testbeds_district", columnList = "district")
})
public class TestbedSponsorship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id")
    private CoFundedPilot pilot;

    @Column(name = "testbed_name", nullable = false, length = 200)
    private String testbedName;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "block", length = 100)
    private String block;

    @Column(name = "village_or_location", length = 150)
    private String villageOrLocation;

    @Column(name = "beneficiaries_impacted")
    private Long beneficiariesImpacted = 0L;

    @Column(name = "beneficiary_count")
    private Integer beneficiaryCount = 0;

    @Column(name = "status", length = 50)
    private String status = "ACTIVE_TRIAL";

    @Enumerated(EnumType.STRING)
    @Column(name = "deployment_status", length = 40)
    private DeploymentStatus deploymentStatus = DeploymentStatus.PLANNED;

    @Column(name = "evidence_photo_urls", columnDefinition = "TEXT")
    private String evidencePhotoUrls;

    @Column(name = "live_data_feed_url", length = 500)
    private String liveDataFeedUrl;

    @Column(name = "project_name", length = 250)
    private String projectName;

    @Column(name = "pilot_phase", length = 80)
    private String pilotPhase;

    @Column(name = "started_at")
    private LocalDate startedAt;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TestbedSponsorship() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public CoFundedPilot getPilot() { return pilot; }
    public void setPilot(CoFundedPilot pilot) { this.pilot = pilot; }

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

    public String getEvidencePhotoUrls() { return evidencePhotoUrls; }
    public void setEvidencePhotoUrls(String evidencePhotoUrls) { this.evidencePhotoUrls = evidencePhotoUrls; }

    public String getLiveDataFeedUrl() { return liveDataFeedUrl; }
    public void setLiveDataFeedUrl(String liveDataFeedUrl) { this.liveDataFeedUrl = liveDataFeedUrl; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getPilotPhase() { return pilotPhase; }
    public void setPilotPhase(String pilotPhase) { this.pilotPhase = pilotPhase; }

    public LocalDate getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDate startedAt) { this.startedAt = startedAt; }

    public LocalDate getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDate completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
