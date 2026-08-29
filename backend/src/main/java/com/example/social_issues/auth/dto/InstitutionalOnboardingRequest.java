package com.example.social_issues.auth.dto;

import com.example.social_issues.auth.model.Role;

public class InstitutionalOnboardingRequest {

    private String name;
    private String email;
    private String phone;
    private String password;
    private String district;
    private String designation;
    private Role role;

    // University Fields
    private String univName;
    private String aisheCode;
    private String univCategory;
    private String[] disciplines;
    private Boolean hasIncubationCenter;

    // Industry Fields
    private String companyName;
    private String companyType;
    private String gstin;
    private String cinNumber;
    private String csrNumber;
    private String[] sectors;

    // Government & PRI Fields
    private String govtDepartment;
    private String serviceCode;
    private String panchayatCode;

    public InstitutionalOnboardingRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getUnivName() {
        return univName;
    }

    public void setUnivName(String univName) {
        this.univName = univName;
    }

    public String getAisheCode() {
        return aisheCode;
    }

    public void setAisheCode(String aisheCode) {
        this.aisheCode = aisheCode;
    }

    public String getUnivCategory() {
        return univCategory;
    }

    public void setUnivCategory(String univCategory) {
        this.univCategory = univCategory;
    }

    public String[] getDisciplines() {
        return disciplines;
    }

    public void setDisciplines(String[] disciplines) {
        this.disciplines = disciplines;
    }

    public Boolean getHasIncubationCenter() {
        return hasIncubationCenter;
    }

    public void setHasIncubationCenter(Boolean hasIncubationCenter) {
        this.hasIncubationCenter = hasIncubationCenter;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyType() {
        return companyType;
    }

    public void setCompanyType(String companyType) {
        this.companyType = companyType;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public String getCinNumber() {
        return cinNumber;
    }

    public void setCinNumber(String cinNumber) {
        this.cinNumber = cinNumber;
    }

    public String getCsrNumber() {
        return csrNumber;
    }

    public void setCsrNumber(String csrNumber) {
        this.csrNumber = csrNumber;
    }

    public String[] getSectors() {
        return sectors;
    }

    public void setSectors(String[] sectors) {
        this.sectors = sectors;
    }

    public String getGovtDepartment() {
        return govtDepartment;
    }

    public void setGovtDepartment(String govtDepartment) {
        this.govtDepartment = govtDepartment;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getPanchayatCode() {
        return panchayatCode;
    }

    public void setPanchayatCode(String panchayatCode) {
        this.panchayatCode = panchayatCode;
    }
}
