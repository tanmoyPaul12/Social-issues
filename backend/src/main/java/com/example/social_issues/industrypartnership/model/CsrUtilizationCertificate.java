package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "csr_utilization_certificates", indexes = {
    @Index(name = "idx_csr_uc_profile", columnList = "industry_profile_id"),
    @Index(name = "idx_csr_uc_pilot", columnList = "pilot_id"),
    @Index(name = "idx_csr_uc_fy", columnList = "financial_year")
})
public class CsrUtilizationCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id")
    private CoFundedPilot pilot;

    @Column(name = "certificate_number", length = 60, nullable = false, unique = true)
    private String certificateNumber;

    @Column(name = "form_type", length = 30, nullable = false)
    private String formType = "GFR_12A";

    @Column(name = "financial_year", length = 20, nullable = false)
    private String financialYear;

    @Column(name = "university_name", length = 200, nullable = false)
    private String universityName;

    @Column(name = "grant_sanction_order_ref", length = 100)
    private String grantSanctionOrderRef;

    @Column(name = "certified_disbursed_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal certifiedDisbursedAmount = BigDecimal.ZERO;

    @Column(name = "certified_utilized_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal certifiedUtilizedAmount = BigDecimal.ZERO;

    @Column(name = "unspent_balance_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal unspentBalanceAmount = BigDecimal.ZERO;

    @Column(name = "ca_auditor_name", length = 150)
    private String caAuditorName;

    @Column(name = "ca_firm_name", length = 150)
    private String caFirmName;

    @Column(name = "ca_membership_number", length = 60)
    private String caMembershipNumber;

    @Column(name = "udin_number", length = 60)
    private String udinNumber;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "certificate_doc_url", length = 500)
    private String certificateDocUrl;

    @Column(name = "storage_key", length = 500)
    private String storageKey;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verified_by_user_id")
    private Long verifiedByUserId;

    @Column(name = "verification_remarks", length = 500)
    private String verificationRemarks;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public CsrUtilizationCertificate() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public CoFundedPilot getPilot() { return pilot; }
    public void setPilot(CoFundedPilot pilot) { this.pilot = pilot; }

    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }

    public String getFormType() { return formType; }
    public void setFormType(String formType) { this.formType = formType; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getGrantSanctionOrderRef() { return grantSanctionOrderRef; }
    public void setGrantSanctionOrderRef(String grantSanctionOrderRef) { this.grantSanctionOrderRef = grantSanctionOrderRef; }

    public BigDecimal getCertifiedDisbursedAmount() { return certifiedDisbursedAmount; }
    public void setCertifiedDisbursedAmount(BigDecimal certifiedDisbursedAmount) { this.certifiedDisbursedAmount = certifiedDisbursedAmount; }

    public BigDecimal getCertifiedUtilizedAmount() { return certifiedUtilizedAmount; }
    public void setCertifiedUtilizedAmount(BigDecimal certifiedUtilizedAmount) { this.certifiedUtilizedAmount = certifiedUtilizedAmount; }

    public BigDecimal getUnspentBalanceAmount() { return unspentBalanceAmount; }
    public void setUnspentBalanceAmount(BigDecimal unspentBalanceAmount) { this.unspentBalanceAmount = unspentBalanceAmount; }

    public String getCaAuditorName() { return caAuditorName; }
    public void setCaAuditorName(String caAuditorName) { this.caAuditorName = caAuditorName; }

    public String getCaFirmName() { return caFirmName; }
    public void setCaFirmName(String caFirmName) { this.caFirmName = caFirmName; }

    public String getCaMembershipNumber() { return caMembershipNumber; }
    public void setCaMembershipNumber(String caMembershipNumber) { this.caMembershipNumber = caMembershipNumber; }

    public String getUdinNumber() { return udinNumber; }
    public void setUdinNumber(String udinNumber) { this.udinNumber = udinNumber; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public String getCertificateDocUrl() { return certificateDocUrl; }
    public void setCertificateDocUrl(String certificateDocUrl) { this.certificateDocUrl = certificateDocUrl; }

    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public Long getVerifiedByUserId() { return verifiedByUserId; }
    public void setVerifiedByUserId(Long verifiedByUserId) { this.verifiedByUserId = verifiedByUserId; }

    public String getVerificationRemarks() { return verificationRemarks; }
    public void setVerificationRemarks(String verificationRemarks) { this.verificationRemarks = verificationRemarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
