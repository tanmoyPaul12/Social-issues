package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.IpStatus;
import com.example.social_issues.projectlifecycle.model.IpType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateIpRecordRequest {

    @NotBlank(message = "IP Title is required")
    private String title;

    private String abstractDescription;

    @NotNull(message = "IP Type is required")
    private IpType ipType = IpType.SHARED_PATENT;

    private String patentApplicationNumber;
    private LocalDate filingDate;
    private String patentOffice;
    private IpStatus status = IpStatus.IDEA_DISCLOSURE;

    private Integer heiOwnershipShare = 50;
    private Integer studentInnovatorsShare = 30;
    private Integer industryPartnerShare = 20;

    private String inventorsList;
    private String commercialPartnerName;
    private String mouDocumentUrl;
    private String mouDocumentStorageKey;
    private String royaltyTerms;

    public CreateIpRecordRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractDescription() { return abstractDescription; }
    public void setAbstractDescription(String abstractDescription) { this.abstractDescription = abstractDescription; }

    public IpType getIpType() { return ipType; }
    public void setIpType(IpType ipType) { this.ipType = ipType; }

    public String getPatentApplicationNumber() { return patentApplicationNumber; }
    public void setPatentApplicationNumber(String patentApplicationNumber) { this.patentApplicationNumber = patentApplicationNumber; }

    public LocalDate getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDate filingDate) { this.filingDate = filingDate; }

    public String getPatentOffice() { return patentOffice; }
    public void setPatentOffice(String patentOffice) { this.patentOffice = patentOffice; }

    public IpStatus getStatus() { return status; }
    public void setStatus(IpStatus status) { this.status = status; }

    public Integer getHeiOwnershipShare() { return heiOwnershipShare; }
    public void setHeiOwnershipShare(Integer heiOwnershipShare) { this.heiOwnershipShare = heiOwnershipShare; }

    public Integer getStudentInnovatorsShare() { return studentInnovatorsShare; }
    public void setStudentInnovatorsShare(Integer studentInnovatorsShare) { this.studentInnovatorsShare = studentInnovatorsShare; }

    public Integer getIndustryPartnerShare() { return industryPartnerShare; }
    public void setIndustryPartnerShare(Integer industryPartnerShare) { this.industryPartnerShare = industryPartnerShare; }

    public String getInventorsList() { return inventorsList; }
    public void setInventorsList(String inventorsList) { this.inventorsList = inventorsList; }

    public String getCommercialPartnerName() { return commercialPartnerName; }
    public void setCommercialPartnerName(String commercialPartnerName) { this.commercialPartnerName = commercialPartnerName; }

    public String getMouDocumentUrl() { return mouDocumentUrl; }
    public void setMouDocumentUrl(String mouDocumentUrl) { this.mouDocumentUrl = mouDocumentUrl; }

    public String getMouDocumentStorageKey() { return mouDocumentStorageKey; }
    public void setMouDocumentStorageKey(String mouDocumentStorageKey) { this.mouDocumentStorageKey = mouDocumentStorageKey; }

    public String getRoyaltyTerms() { return royaltyTerms; }
    public void setRoyaltyTerms(String royaltyTerms) { this.royaltyTerms = royaltyTerms; }
}
