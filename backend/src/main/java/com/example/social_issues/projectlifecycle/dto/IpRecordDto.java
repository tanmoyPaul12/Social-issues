package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.IntellectualPropertyRecord;
import com.example.social_issues.projectlifecycle.model.IpStatus;
import com.example.social_issues.projectlifecycle.model.IpType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class IpRecordDto {

    private Long id;
    private Long projectId;
    private String title;
    private String abstractDescription;
    private IpType ipType;
    private String patentApplicationNumber;
    private LocalDate filingDate;
    private LocalDate grantDate;
    private String patentOffice;
    private IpStatus status;
    private Integer heiOwnershipShare;
    private Integer studentInnovatorsShare;
    private Integer industryPartnerShare;
    private String inventorsList;
    private String commercialPartnerName;
    private String mouDocumentUrl;
    private String mouDocumentStorageKey;
    private String royaltyTerms;
    private Long submittedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IpRecordDto() {}

    public static IpRecordDto fromEntity(IntellectualPropertyRecord entity) {
        if (entity == null) return null;
        IpRecordDto dto = new IpRecordDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setTitle(entity.getTitle());
        dto.setAbstractDescription(entity.getAbstractDescription());
        dto.setIpType(entity.getIpType());
        dto.setPatentApplicationNumber(entity.getPatentApplicationNumber());
        dto.setFilingDate(entity.getFilingDate());
        dto.setGrantDate(entity.getGrantDate());
        dto.setPatentOffice(entity.getPatentOffice());
        dto.setStatus(entity.getStatus());
        dto.setHeiOwnershipShare(entity.getHeiOwnershipShare());
        dto.setStudentInnovatorsShare(entity.getStudentInnovatorsShare());
        dto.setIndustryPartnerShare(entity.getIndustryPartnerShare());
        dto.setInventorsList(entity.getInventorsList());
        dto.setCommercialPartnerName(entity.getCommercialPartnerName());
        dto.setMouDocumentUrl(entity.getMouDocumentUrl());
        dto.setMouDocumentStorageKey(entity.getMouDocumentStorageKey());
        dto.setRoyaltyTerms(entity.getRoyaltyTerms());
        dto.setSubmittedByUserId(entity.getSubmittedByUserId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

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

    public LocalDate getGrantDate() { return grantDate; }
    public void setGrantDate(LocalDate grantDate) { this.grantDate = grantDate; }

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

    public Long getSubmittedByUserId() { return submittedByUserId; }
    public void setSubmittedByUserId(Long submittedByUserId) { this.submittedByUserId = submittedByUserId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
