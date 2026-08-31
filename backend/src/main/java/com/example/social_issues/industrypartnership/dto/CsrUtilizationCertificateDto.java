package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.CsrUtilizationCertificate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CsrUtilizationCertificateDto {

    private Long id;
    private Long pilotId;
    private String pilotTitle;
    private String certificateNumber;
    private String formType;
    private String financialYear;
    private String universityName;
    private String grantSanctionOrderRef;

    private BigDecimal certifiedDisbursedAmount;
    private String certifiedDisbursedFormatted;

    private BigDecimal certifiedUtilizedAmount;
    private String certifiedUtilizedFormatted;

    private BigDecimal unspentBalanceAmount;
    private String unspentBalanceFormatted;

    private String caAuditorName;
    private String caFirmName;
    private String caMembershipNumber;
    private String udinNumber;

    private LocalDate issueDate;
    private String certificateDocUrl;

    private Boolean isVerified;
    private LocalDateTime verifiedAt;
    private String verificationRemarks;
    private LocalDateTime createdAt;

    public CsrUtilizationCertificateDto() {}

    public static CsrUtilizationCertificateDto fromEntity(CsrUtilizationCertificate uc) {
        CsrUtilizationCertificateDto dto = new CsrUtilizationCertificateDto();
        dto.setId(uc.getId());
        if (uc.getPilot() != null) {
            dto.setPilotId(uc.getPilot().getId());
            dto.setPilotTitle(uc.getPilot().getTitle());
        } else {
            dto.setPilotTitle("Direct University R&D Grant");
        }
        dto.setCertificateNumber(uc.getCertificateNumber());
        dto.setFormType(uc.getFormType());
        dto.setFinancialYear(uc.getFinancialYear());
        dto.setUniversityName(uc.getUniversityName());
        dto.setGrantSanctionOrderRef(uc.getGrantSanctionOrderRef());

        dto.setCertifiedDisbursedAmount(uc.getCertifiedDisbursedAmount());
        dto.setCertifiedDisbursedFormatted(formatCurrency(uc.getCertifiedDisbursedAmount()));

        dto.setCertifiedUtilizedAmount(uc.getCertifiedUtilizedAmount());
        dto.setCertifiedUtilizedFormatted(formatCurrency(uc.getCertifiedUtilizedAmount()));

        dto.setUnspentBalanceAmount(uc.getUnspentBalanceAmount());
        dto.setUnspentBalanceFormatted(formatCurrency(uc.getUnspentBalanceAmount()));

        dto.setCaAuditorName(uc.getCaAuditorName());
        dto.setCaFirmName(uc.getCaFirmName());
        dto.setCaMembershipNumber(uc.getCaMembershipNumber());
        dto.setUdinNumber(uc.getUdinNumber());

        dto.setIssueDate(uc.getIssueDate());
        dto.setCertificateDocUrl(uc.getCertificateDocUrl());

        dto.setIsVerified(uc.getIsVerified());
        dto.setVerifiedAt(uc.getVerifiedAt());
        dto.setVerificationRemarks(uc.getVerificationRemarks());
        dto.setCreatedAt(uc.getCreatedAt());

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

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public String getPilotTitle() { return pilotTitle; }
    public void setPilotTitle(String pilotTitle) { this.pilotTitle = pilotTitle; }

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

    public String getCertifiedDisbursedFormatted() { return certifiedDisbursedFormatted; }
    public void setCertifiedDisbursedFormatted(String certifiedDisbursedFormatted) { this.certifiedDisbursedFormatted = certifiedDisbursedFormatted; }

    public BigDecimal getCertifiedUtilizedAmount() { return certifiedUtilizedAmount; }
    public void setCertifiedUtilizedAmount(BigDecimal certifiedUtilizedAmount) { this.certifiedUtilizedAmount = certifiedUtilizedAmount; }

    public String getCertifiedUtilizedFormatted() { return certifiedUtilizedFormatted; }
    public void setCertifiedUtilizedFormatted(String certifiedUtilizedFormatted) { this.certifiedUtilizedFormatted = certifiedUtilizedFormatted; }

    public BigDecimal getUnspentBalanceAmount() { return unspentBalanceAmount; }
    public void setUnspentBalanceAmount(BigDecimal unspentBalanceAmount) { this.unspentBalanceAmount = unspentBalanceAmount; }

    public String getUnspentBalanceFormatted() { return unspentBalanceFormatted; }
    public void setUnspentBalanceFormatted(String unspentBalanceFormatted) { this.unspentBalanceFormatted = unspentBalanceFormatted; }

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

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerificationRemarks() { return verificationRemarks; }
    public void setVerificationRemarks(String verificationRemarks) { this.verificationRemarks = verificationRemarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
