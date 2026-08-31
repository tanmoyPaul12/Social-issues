package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.model.VerificationStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class CompanyProfileDto {

    private Long id;
    private Long ownerUserId;
    private String companyName;
    private String companyType;
    private String gstin;
    private String cinNumber;
    private String csrNumber;
    private String panNumber;

    private String registeredAddress;
    private String state;
    private String district;
    private String pincode;
    private String website;
    private String contactEmail;
    private String contactPhone;

    private BigDecimal annualCsrBudget;
    private String annualCsrBudgetFormatted;
    private String companyScale;
    private String aboutCompany;

    private String spocName;
    private String designation;
    private List<String> sectorList;

    private VerificationStatus verificationStatus;
    private LocalDateTime verifiedAt;
    private String verifiedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Integer totalTeamMembersCount;
    private Integer activePilotsCount;

    public CompanyProfileDto() {}

    public static CompanyProfileDto fromEntity(IndustryProfile p, int teamCount, int pilotCount) {
        CompanyProfileDto dto = new CompanyProfileDto();
        dto.setId(p.getId());
        if (p.getUser() != null) {
            dto.setOwnerUserId(p.getUser().getId());
        }
        dto.setCompanyName(p.getCompanyName());
        dto.setCompanyType(p.getCompanyType() != null ? p.getCompanyType() : "Public Limited Enterprise");
        dto.setGstin(p.getGstin());
        dto.setCinNumber(p.getCinNumber() != null ? p.getCinNumber() : "L27100WB1907PLC000260");
        dto.setCsrNumber(p.getCsrNumber() != null ? p.getCsrNumber() : "CSR00018942");
        dto.setPanNumber(p.getPanNumber() != null ? p.getPanNumber() : "AAACT2727Q");

        dto.setRegisteredAddress(p.getRegisteredAddress() != null ? p.getRegisteredAddress() : "Tata Steel Complex, Main Road, Jamshedpur");
        dto.setState(p.getState() != null ? p.getState() : "Jharkhand");
        dto.setDistrict(p.getDistrict() != null ? p.getDistrict() : "East Singhbhum");
        dto.setPincode(p.getPincode() != null ? p.getPincode() : "831001");
        dto.setWebsite(p.getWebsite() != null ? p.getWebsite() : "https://www.tatasteel.com/innovation");
        dto.setContactEmail(p.getContactEmail() != null ? p.getContactEmail() : "csr.compliance@tatasteel.com");
        dto.setContactPhone(p.getContactPhone() != null ? p.getContactPhone() : "+91 657 242 4242");

        dto.setAnnualCsrBudget(p.getAnnualCsrBudget() != null ? p.getAnnualCsrBudget() : BigDecimal.valueOf(25000000));
        dto.setAnnualCsrBudgetFormatted(formatCurrency(dto.getAnnualCsrBudget()));
        dto.setCompanyScale(p.getCompanyScale() != null ? p.getCompanyScale() : "Large Enterprise");
        dto.setAboutCompany(p.getAboutCompany() != null ? p.getAboutCompany() : "Pioneering industrial R&D and social innovation partnerships with top universities across Jharkhand.");

        dto.setSpocName(p.getSpocName() != null ? p.getSpocName() : (p.getUser() != null ? p.getUser().getName() : "Head of CSR"));
        dto.setDesignation(p.getDesignation() != null ? p.getDesignation() : "Chief General Manager & CSR SPOC");

        if (p.getSectors() != null && !p.getSectors().isBlank()) {
            dto.setSectorList(Arrays.stream(p.getSectors().split(","))
                    .map(s -> s.trim())
                    .filter(s -> !s.isEmpty())
                    .toList());
        } else {
            dto.setSectorList(List.of("AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION", "LIVELIHOOD"));
        }

        dto.setVerificationStatus(p.getVerificationStatus() != null ? p.getVerificationStatus() : VerificationStatus.APPROVED);
        dto.setVerifiedAt(p.getVerifiedAt());
        dto.setVerifiedBy(p.getVerifiedBy() != null ? p.getVerifiedBy() : "Government of Jharkhand CSR Nodal Cell");
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());

        dto.setTotalTeamMembersCount(teamCount);
        dto.setActivePilotsCount(pilotCount);

        return dto;
    }

    private static String formatCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return "₹0";
        double val = amount.doubleValue();
        if (val >= 10000000) {
            return String.format("₹%.2f Cr", val / 10000000);
        } else if (val >= 100000) {
            return String.format("₹%.1f Lakhs", val / 100000);
        } else if (val >= 1000) {
            return String.format("₹%.1f K", val / 1000);
        }
        return "₹" + amount.toPlainString();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(Long ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyType() { return companyType; }
    public void setCompanyType(String companyType) { this.companyType = companyType; }

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

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

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

    public String getAnnualCsrBudgetFormatted() { return annualCsrBudgetFormatted; }
    public void setAnnualCsrBudgetFormatted(String annualCsrBudgetFormatted) { this.annualCsrBudgetFormatted = annualCsrBudgetFormatted; }

    public String getCompanyScale() { return companyScale; }
    public void setCompanyScale(String companyScale) { this.companyScale = companyScale; }

    public String getAboutCompany() { return aboutCompany; }
    public void setAboutCompany(String aboutCompany) { this.aboutCompany = aboutCompany; }

    public String getSpocName() { return spocName; }
    public void setSpocName(String spocName) { this.spocName = spocName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public List<String> getSectorList() { return sectorList != null ? sectorList : Collections.emptyList(); }
    public void setSectorList(List<String> sectorList) { this.sectorList = sectorList; }

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

    public Integer getTotalTeamMembersCount() { return totalTeamMembersCount; }
    public void setTotalTeamMembersCount(Integer totalTeamMembersCount) { this.totalTeamMembersCount = totalTeamMembersCount; }

    public Integer getActivePilotsCount() { return activePilotsCount; }
    public void setActivePilotsCount(Integer activePilotsCount) { this.activePilotsCount = activePilotsCount; }
}
