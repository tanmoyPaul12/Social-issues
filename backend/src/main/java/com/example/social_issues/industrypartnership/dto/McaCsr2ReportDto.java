package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class McaCsr2ReportDto {

    private String reportReferenceNumber;
    private String financialYear;
    private LocalDate generatedDate;

    // Company Particulars
    private String cinNumber;
    private String companyName;
    private String registeredOfficeAddress;
    private String email;
    private String website;

    // CSR Committee & Budget Obligations
    private BigDecimal averageNetProfitPrecedingThreeYears;
    private BigDecimal mandatoryTwoPercentObligation;
    private BigDecimal unspentCarriedForwardFromPreviousYears;
    private BigDecimal totalCsrBudgetToSpend;
    private BigDecimal totalCsrAmountSpentOngoingProjects;
    private BigDecimal totalCsrAmountSpentOtherThanOngoing;
    private BigDecimal totalCsrAmountTransferredToUnspentAccount;
    private BigDecimal unspentSurplusBalance;

    // Ongoing Projects Table (Annexure II Format)
    private List<OngoingProjectFilingDto> ongoingProjects;

    // Implementing Agency Table (Form CSR-1 registrations)
    private List<ImplementingAgencyFilingDto> implementingAgencies;

    public static class OngoingProjectFilingDto {
        private String projectSerialNumber;
        private String projectTitle;
        private String scheduleVIIItem;
        private String localAreaState;
        private String localAreaDistrict;
        private Integer projectDurationMonths;
        private BigDecimal totalBudgetApproved;
        private BigDecimal amountSpentInCurrentFy;
        private BigDecimal cumulativeSpendTillDate;
        private String modeOfImplementation; // Direct or Through Implementing Agency
        private String implementingAgencyName;
        private String implementingAgencyCsr1RegNumber;
        private String status; // ON_GOING or COMPLETED

        public OngoingProjectFilingDto() {}

        // Getters and Setters
        public String getProjectSerialNumber() { return projectSerialNumber; }
        public void setProjectSerialNumber(String projectSerialNumber) { this.projectSerialNumber = projectSerialNumber; }

        public String getProjectTitle() { return projectTitle; }
        public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

        public String getScheduleVIIItem() { return scheduleVIIItem; }
        public void setScheduleVIIItem(String scheduleVIIItem) { this.scheduleVIIItem = scheduleVIIItem; }

        public String getLocalAreaState() { return localAreaState; }
        public void setLocalAreaState(String localAreaState) { this.localAreaState = localAreaState; }

        public String getLocalAreaDistrict() { return localAreaDistrict; }
        public void setLocalAreaDistrict(String localAreaDistrict) { this.localAreaDistrict = localAreaDistrict; }

        public Integer getProjectDurationMonths() { return projectDurationMonths; }
        public void setProjectDurationMonths(Integer projectDurationMonths) { this.projectDurationMonths = projectDurationMonths; }

        public BigDecimal getTotalBudgetApproved() { return totalBudgetApproved; }
        public void setTotalBudgetApproved(BigDecimal totalBudgetApproved) { this.totalBudgetApproved = totalBudgetApproved; }

        public BigDecimal getAmountSpentInCurrentFy() { return amountSpentInCurrentFy; }
        public void setAmountSpentInCurrentFy(BigDecimal amountSpentInCurrentFy) { this.amountSpentInCurrentFy = amountSpentInCurrentFy; }

        public BigDecimal getCumulativeSpendTillDate() { return cumulativeSpendTillDate; }
        public void setCumulativeSpendTillDate(BigDecimal cumulativeSpendTillDate) { this.cumulativeSpendTillDate = cumulativeSpendTillDate; }

        public String getModeOfImplementation() { return modeOfImplementation; }
        public void setModeOfImplementation(String modeOfImplementation) { this.modeOfImplementation = modeOfImplementation; }

        public String getImplementingAgencyName() { return implementingAgencyName; }
        public void setImplementingAgencyName(String implementingAgencyName) { this.implementingAgencyName = implementingAgencyName; }

        public String getImplementingAgencyCsr1RegNumber() { return implementingAgencyCsr1RegNumber; }
        public void setImplementingAgencyCsr1RegNumber(String implementingAgencyCsr1RegNumber) { this.implementingAgencyCsr1RegNumber = implementingAgencyCsr1RegNumber; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ImplementingAgencyFilingDto {
        private String csr1RegistrationNumber;
        private String agencyName;
        private String agencyType; // Public University / Autonomous Research Body
        private String pan;
        private String state;
        private String district;
        private BigDecimal totalAmountAllocated;

        public ImplementingAgencyFilingDto() {}

        // Getters and Setters
        public String getCsr1RegistrationNumber() { return csr1RegistrationNumber; }
        public void setCsr1RegistrationNumber(String csr1RegistrationNumber) { this.csr1RegistrationNumber = csr1RegistrationNumber; }

        public String getAgencyName() { return agencyName; }
        public void setAgencyName(String agencyName) { this.agencyName = agencyName; }

        public String getAgencyType() { return agencyType; }
        public void setAgencyType(String agencyType) { this.agencyType = agencyType; }

        public String getPan() { return pan; }
        public void setPan(String pan) { this.pan = pan; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public BigDecimal getTotalAmountAllocated() { return totalAmountAllocated; }
        public void setTotalAmountAllocated(BigDecimal totalAmountAllocated) { this.totalAmountAllocated = totalAmountAllocated; }
    }

    public McaCsr2ReportDto() {}

    // Getters and Setters
    public String getReportReferenceNumber() { return reportReferenceNumber; }
    public void setReportReferenceNumber(String reportReferenceNumber) { this.reportReferenceNumber = reportReferenceNumber; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public LocalDate getGeneratedDate() { return generatedDate; }
    public void setGeneratedDate(LocalDate generatedDate) { this.generatedDate = generatedDate; }

    public String getCinNumber() { return cinNumber; }
    public void setCinNumber(String cinNumber) { this.cinNumber = cinNumber; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getRegisteredOfficeAddress() { return registeredOfficeAddress; }
    public void setRegisteredOfficeAddress(String registeredOfficeAddress) { this.registeredOfficeAddress = registeredOfficeAddress; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public BigDecimal getAverageNetProfitPrecedingThreeYears() { return averageNetProfitPrecedingThreeYears; }
    public void setAverageNetProfitPrecedingThreeYears(BigDecimal averageNetProfitPrecedingThreeYears) { this.averageNetProfitPrecedingThreeYears = averageNetProfitPrecedingThreeYears; }

    public BigDecimal getMandatoryTwoPercentObligation() { return mandatoryTwoPercentObligation; }
    public void setMandatoryTwoPercentObligation(BigDecimal mandatoryTwoPercentObligation) { this.mandatoryTwoPercentObligation = mandatoryTwoPercentObligation; }

    public BigDecimal getUnspentCarriedForwardFromPreviousYears() { return unspentCarriedForwardFromPreviousYears; }
    public void setUnspentCarriedForwardFromPreviousYears(BigDecimal unspentCarriedForwardFromPreviousYears) { this.unspentCarriedForwardFromPreviousYears = unspentCarriedForwardFromPreviousYears; }

    public BigDecimal getTotalCsrBudgetToSpend() { return totalCsrBudgetToSpend; }
    public void setTotalCsrBudgetToSpend(BigDecimal totalCsrBudgetToSpend) { this.totalCsrBudgetToSpend = totalCsrBudgetToSpend; }

    public BigDecimal getTotalCsrAmountSpentOngoingProjects() { return totalCsrAmountSpentOngoingProjects; }
    public void setTotalCsrAmountSpentOngoingProjects(BigDecimal totalCsrAmountSpentOngoingProjects) { this.totalCsrAmountSpentOngoingProjects = totalCsrAmountSpentOngoingProjects; }

    public BigDecimal getTotalCsrAmountSpentOtherThanOngoing() { return totalCsrAmountSpentOtherThanOngoing; }
    public void setTotalCsrAmountSpentOtherThanOngoing(BigDecimal totalCsrAmountSpentOtherThanOngoing) { this.totalCsrAmountSpentOtherThanOngoing = totalCsrAmountSpentOtherThanOngoing; }

    public BigDecimal getTotalCsrAmountTransferredToUnspentAccount() { return totalCsrAmountTransferredToUnspentAccount; }
    public void setTotalCsrAmountTransferredToUnspentAccount(BigDecimal totalCsrAmountTransferredToUnspentAccount) { this.totalCsrAmountTransferredToUnspentAccount = totalCsrAmountTransferredToUnspentAccount; }

    public BigDecimal getUnspentSurplusBalance() { return unspentSurplusBalance; }
    public void setUnspentSurplusBalance(BigDecimal unspentSurplusBalance) { this.unspentSurplusBalance = unspentSurplusBalance; }

    public List<OngoingProjectFilingDto> getOngoingProjects() { return ongoingProjects; }
    public void setOngoingProjects(List<OngoingProjectFilingDto> ongoingProjects) { this.ongoingProjects = ongoingProjects; }

    public List<ImplementingAgencyFilingDto> getImplementingAgencies() { return implementingAgencies; }
    public void setImplementingAgencies(List<ImplementingAgencyFilingDto> implementingAgencies) { this.implementingAgencies = implementingAgencies; }
}
