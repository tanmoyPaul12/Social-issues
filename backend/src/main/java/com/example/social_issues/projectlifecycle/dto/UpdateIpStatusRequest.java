package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.IpStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class UpdateIpStatusRequest {

    @NotNull(message = "Status is required")
    private IpStatus status;

    private String patentApplicationNumber;
    private LocalDate filingDate;
    private LocalDate grantDate;
    private String patentOffice;
    private String commercialPartnerName;
    private String royaltyTerms;
    private String mouDocumentUrl;

    public UpdateIpStatusRequest() {}

    public IpStatus getStatus() { return status; }
    public void setStatus(IpStatus status) { this.status = status; }

    public String getPatentApplicationNumber() { return patentApplicationNumber; }
    public void setPatentApplicationNumber(String patentApplicationNumber) { this.patentApplicationNumber = patentApplicationNumber; }

    public LocalDate getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDate filingDate) { this.filingDate = filingDate; }

    public LocalDate getGrantDate() { return grantDate; }
    public void setGrantDate(LocalDate grantDate) { this.grantDate = grantDate; }

    public String getPatentOffice() { return patentOffice; }
    public void setPatentOffice(String patentOffice) { this.patentOffice = patentOffice; }

    public String getCommercialPartnerName() { return commercialPartnerName; }
    public void setCommercialPartnerName(String commercialPartnerName) { this.commercialPartnerName = commercialPartnerName; }

    public String getRoyaltyTerms() { return royaltyTerms; }
    public void setRoyaltyTerms(String royaltyTerms) { this.royaltyTerms = royaltyTerms; }

    public String getMouDocumentUrl() { return mouDocumentUrl; }
    public void setMouDocumentUrl(String mouDocumentUrl) { this.mouDocumentUrl = mouDocumentUrl; }
}
