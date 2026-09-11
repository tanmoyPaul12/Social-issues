package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.AgreementType;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class CreateAgreementRequest {

    private Long pilotId;
    private Long universityId;
    private String universityName;

    @NotBlank(message = "Agreement title is required")
    private String agreementTitle;

    private AgreementType agreementType = AgreementType.MOU;
    private Double ipSplitPercentIndustry = 50.0;
    private Double ipSplitPercentUniversity = 50.0;
    private String scopeDescription;
    private String signatoryIndustryName;
    private String signatoryUniversityName;
    private LocalDateTime expiresAt;

    public CreateAgreementRequest() {}

    // Getters and Setters
    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public Long getUniversityId() { return universityId; }
    public void setUniversityId(Long universityId) { this.universityId = universityId; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getAgreementTitle() { return agreementTitle; }
    public void setAgreementTitle(String agreementTitle) { this.agreementTitle = agreementTitle; }

    public AgreementType getAgreementType() { return agreementType; }
    public void setAgreementType(AgreementType agreementType) { this.agreementType = agreementType; }

    public Double getIpSplitPercentIndustry() { return ipSplitPercentIndustry; }
    public void setIpSplitPercentIndustry(Double ipSplitPercentIndustry) { this.ipSplitPercentIndustry = ipSplitPercentIndustry; }

    public Double getIpSplitPercentUniversity() { return ipSplitPercentUniversity; }
    public void setIpSplitPercentUniversity(Double ipSplitPercentUniversity) { this.ipSplitPercentUniversity = ipSplitPercentUniversity; }

    public String getScopeDescription() { return scopeDescription; }
    public void setScopeDescription(String scopeDescription) { this.scopeDescription = scopeDescription; }

    public String getSignatoryIndustryName() { return signatoryIndustryName; }
    public void setSignatoryIndustryName(String signatoryIndustryName) { this.signatoryIndustryName = signatoryIndustryName; }

    public String getSignatoryUniversityName() { return signatoryUniversityName; }
    public void setSignatoryUniversityName(String signatoryUniversityName) { this.signatoryUniversityName = signatoryUniversityName; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
