package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.AgreementStatus;
import com.example.social_issues.industrypartnership.model.AgreementType;
import com.example.social_issues.industrypartnership.model.CoDevelopmentAgreement;

import java.time.LocalDateTime;

public class CoDevelopmentAgreementDto {

    private Long id;
    private Long pilotId;
    private String pilotTitle;
    private Long industryProfileId;
    private String industryName;
    private Long universityId;
    private String universityName;
    private String agreementTitle;
    private AgreementType agreementType;
    private AgreementStatus status;
    private String documentUrl;
    private String documentFileName;
    private LocalDateTime signedAt;
    private LocalDateTime expiresAt;
    private Double ipSplitPercentIndustry;
    private Double ipSplitPercentUniversity;
    private String scopeDescription;
    private String signatoryIndustryName;
    private String signatoryUniversityName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CoDevelopmentAgreementDto() {}

    public static CoDevelopmentAgreementDto fromEntity(CoDevelopmentAgreement entity) {
        CoDevelopmentAgreementDto dto = new CoDevelopmentAgreementDto();
        dto.setId(entity.getId());
        if (entity.getIndustryProfile() != null) {
            dto.setIndustryProfileId(entity.getIndustryProfile().getId());
            dto.setIndustryName(entity.getIndustryProfile().getCompanyName());
        }
        if (entity.getPilot() != null) {
            dto.setPilotId(entity.getPilot().getId());
            dto.setPilotTitle(entity.getPilot().getTitle());
        }
        dto.setUniversityId(entity.getUniversityId());
        dto.setUniversityName(entity.getUniversityName());
        dto.setAgreementTitle(entity.getAgreementTitle());
        dto.setAgreementType(entity.getAgreementType());
        dto.setStatus(entity.getStatus());
        dto.setDocumentUrl(entity.getDocumentUrl());
        dto.setDocumentFileName(entity.getDocumentFileName());
        dto.setSignedAt(entity.getSignedAt());
        dto.setExpiresAt(entity.getExpiresAt());
        dto.setIpSplitPercentIndustry(entity.getIpSplitPercentIndustry());
        dto.setIpSplitPercentUniversity(entity.getIpSplitPercentUniversity());
        dto.setScopeDescription(entity.getScopeDescription());
        dto.setSignatoryIndustryName(entity.getSignatoryIndustryName());
        dto.setSignatoryUniversityName(entity.getSignatoryUniversityName());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public String getPilotTitle() { return pilotTitle; }
    public void setPilotTitle(String pilotTitle) { this.pilotTitle = pilotTitle; }

    public Long getIndustryProfileId() { return industryProfileId; }
    public void setIndustryProfileId(Long industryProfileId) { this.industryProfileId = industryProfileId; }

    public String getIndustryName() { return industryName; }
    public void setIndustryName(String industryName) { this.industryName = industryName; }

    public Long getUniversityId() { return universityId; }
    public void setUniversityId(Long universityId) { this.universityId = universityId; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getAgreementTitle() { return agreementTitle; }
    public void setAgreementTitle(String agreementTitle) { this.agreementTitle = agreementTitle; }

    public AgreementType getAgreementType() { return agreementType; }
    public void setAgreementType(AgreementType agreementType) { this.agreementType = agreementType; }

    public AgreementStatus getStatus() { return status; }
    public void setStatus(AgreementStatus status) { this.status = status; }

    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

    public String getDocumentFileName() { return documentFileName; }
    public void setDocumentFileName(String documentFileName) { this.documentFileName = documentFileName; }

    public LocalDateTime getSignedAt() { return signedAt; }
    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
