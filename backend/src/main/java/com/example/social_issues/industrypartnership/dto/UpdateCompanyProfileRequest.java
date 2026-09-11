package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.PartnerCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public class UpdateCompanyProfileRequest {

    @NotBlank(message = "Company legal name is required")
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String companyName;

    private String companyType;
    private PartnerCategory partnerCategory;
    private String dpiitRecognitionNumber;
    private String udyamRegistrationNumber;
    private String taxExemptionNumber;
    private String institutionRegNumber;
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
    private String companyScale;
    private String aboutCompany;

    private String spocName;
    private String designation;
    private List<String> sectors;

    public UpdateCompanyProfileRequest() {}

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

    public String getCompanyScale() { return companyScale; }
    public void setCompanyScale(String companyScale) { this.companyScale = companyScale; }

    public String getAboutCompany() { return aboutCompany; }
    public void setAboutCompany(String aboutCompany) { this.aboutCompany = aboutCompany; }

    public String getSpocName() { return spocName; }
    public void setSpocName(String spocName) { this.spocName = spocName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public List<String> getSectors() { return sectors; }
    public void setSectors(List<String> sectors) { this.sectors = sectors; }
}
