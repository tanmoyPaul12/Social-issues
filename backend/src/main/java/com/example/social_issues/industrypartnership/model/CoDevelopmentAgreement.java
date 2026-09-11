package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "co_development_agreements")
public class CoDevelopmentAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id")
    private CoFundedPilot pilot;

    @Column(name = "university_id")
    private Long universityId;

    @Column(name = "university_name")
    private String universityName;

    @Column(name = "agreement_title", nullable = false)
    private String agreementTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "agreement_type", nullable = false)
    private AgreementType agreementType = AgreementType.MOU;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AgreementStatus status = AgreementStatus.DRAFT;

    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "document_file_name")
    private String documentFileName;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "ip_split_percent_industry")
    private Double ipSplitPercentIndustry = 50.0;

    @Column(name = "ip_split_percent_university")
    private Double ipSplitPercentUniversity = 50.0;

    @Column(name = "scope_description", columnDefinition = "TEXT")
    private String scopeDescription;

    @Column(name = "signatory_industry_name")
    private String signatoryIndustryName;

    @Column(name = "signatory_university_name")
    private String signatoryUniversityName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public CoDevelopmentAgreement() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (status == null) status = AgreementStatus.DRAFT;
        if (agreementType == null) agreementType = AgreementType.MOU;
        if (ipSplitPercentIndustry == null) ipSplitPercentIndustry = 50.0;
        if (ipSplitPercentUniversity == null) ipSplitPercentUniversity = 50.0;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public CoFundedPilot getPilot() { return pilot; }
    public void setPilot(CoFundedPilot pilot) { this.pilot = pilot; }

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
