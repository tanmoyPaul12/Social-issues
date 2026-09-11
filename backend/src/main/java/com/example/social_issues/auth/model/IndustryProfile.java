package com.example.social_issues.auth.model;

import com.example.social_issues.industrypartnership.model.PartnerCategory;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "industry_profiles")
public class IndustryProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_type", length = 80)
    private String companyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "partner_category", length = 50)
    private PartnerCategory partnerCategory = PartnerCategory.LARGE_ENTERPRISE;

    @Column(name = "dpiit_recognition_number", length = 50)
    private String dpiitRecognitionNumber;

    @Column(name = "udyam_registration_number", length = 50)
    private String udyamRegistrationNumber;

    @Column(name = "tax_exemption_number", length = 50)
    private String taxExemptionNumber;

    @Column(name = "institution_reg_number", length = 50)
    private String institutionRegNumber;

    @Column(name = "gstin", length = 50)
    private String gstin;

    @Column(name = "cin_number", length = 50)
    private String cinNumber;

    @Column(name = "csr_number", length = 50)
    private String csrNumber;

    @Column(name = "pan_number", length = 30)
    private String panNumber;

    @Column(name = "registered_address", length = 500)
    private String registeredAddress;

    @Column(name = "state", length = 80)
    private String state = "Jharkhand";

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "annual_csr_budget", precision = 19, scale = 2)
    private BigDecimal annualCsrBudget;

    @Column(name = "company_scale", length = 60)
    private String companyScale = "Large Enterprise";

    @Column(name = "about_company", length = 2000)
    private String aboutCompany;

    @Column(name = "spoc_name")
    private String spocName;

    @Column(name = "designation", length = 120)
    private String designation;

    @Column(name = "district", length = 80)
    private String district;

    @Column(name = "sectors", length = 800)
    private String sectors;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 40)
    private VerificationStatus verificationStatus = VerificationStatus.APPROVED;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verified_by", length = 120)
    private String verifiedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public IndustryProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyType() { return companyType; }
    public void setCompanyType(String companyType) { this.companyType = companyType; }

    public PartnerCategory getPartnerCategory() { return partnerCategory; }
    public void setPartnerCategory(PartnerCategory partnerCategory) { this.partnerCategory = partnerCategory; }

    public String getDpiitRecognitionNumber() { return dpiitRecognitionNumber; }
    public void setDpiitRecognitionNumber(String dpiitRecognitionNumber) { this.dpiitRecognitionNumber = dpiitRecognitionNumber; }

    public String getUdyamRegistrationNumber() { return udyamRegistrationNumber; }
    public void setUdyamRegistrationNumber(String udyamRegistrationNumber) { this.udyamRegistrationNumber = udyamRegistrationNumber; }

    public String getTaxExemptionNumber() { return taxExemptionNumber; }
    public void setTaxExemptionNumber(String taxExemptionNumber) { this.taxExemptionNumber = taxExemptionNumber; }

    public String getInstitutionRegNumber() { return institutionRegNumber; }
    public void setInstitutionRegNumber(String institutionRegNumber) { this.institutionRegNumber = institutionRegNumber; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public String getCinNumber() { return cinNumber; }
    public void setCinNumber(String cinNumber) { this.cinNumber = cinNumber; }

    public String getCsrNumber() { return csrNumber; }
    public void setCsrNumber(String csrNumber) { this.csrNumber = csrNumber; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getRegisteredAddress() { return registeredAddress; }
    public void setRegisteredAddress(String registeredAddress) { this.registeredAddress = registeredAddress; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public BigDecimal getAnnualCsrBudget() { return annualCsrBudget; }
    public void setAnnualCsrBudget(BigDecimal annualCsrBudget) { this.annualCsrBudget = annualCsrBudget; }

    public String getCompanyScale() { return companyScale; }
    public void setCompanyScale(String companyScale) { this.companyScale = companyScale; }

    public String getAboutCompany() { return aboutCompany; }
    public void setAboutCompany(String aboutCompany) { this.aboutCompany = aboutCompany; }

    public String getSpocName() { return spocName; }
    public void setSpocName(String spocName) { this.spocName = spocName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getSectors() { return sectors; }
    public void setSectors(String sectors) { this.sectors = sectors; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
