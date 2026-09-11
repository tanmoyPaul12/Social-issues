package com.example.social_issues.projectlifecycle.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "intellectual_property_records", indexes = {
    @Index(name = "idx_ip_project_id", columnList = "project_id"),
    @Index(name = "idx_ip_status", columnList = "status"),
    @Index(name = "idx_ip_type", columnList = "ip_type"),
    @Index(name = "idx_ip_patent_app_num", columnList = "patent_application_number")
})
public class IntellectualPropertyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "abstract_description", columnDefinition = "TEXT")
    private String abstractDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "ip_type", nullable = false, length = 50)
    private IpType ipType = IpType.SHARED_PATENT;

    @Column(name = "patent_application_number", length = 100)
    private String patentApplicationNumber;

    @Column(name = "filing_date")
    private LocalDate filingDate;

    @Column(name = "grant_date")
    private LocalDate grantDate;

    @Column(name = "patent_office", length = 150)
    private String patentOffice = "Indian Patent Office (IPO) Kolkata";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private IpStatus status = IpStatus.IDEA_DISCLOSURE;

    @Column(name = "hei_ownership_share")
    private Integer heiOwnershipShare = 50;

    @Column(name = "student_innovators_share")
    private Integer studentInnovatorsShare = 30;

    @Column(name = "industry_partner_share")
    private Integer industryPartnerShare = 20;

    @Column(name = "inventors_list", columnDefinition = "TEXT")
    private String inventorsList;

    @Column(name = "commercial_partner_name", length = 200)
    private String commercialPartnerName;

    @Column(name = "mou_document_url", length = 500)
    private String mouDocumentUrl;

    @Column(name = "mou_document_storage_key", length = 255)
    private String mouDocumentStorageKey;

    @Column(name = "royalty_terms", columnDefinition = "TEXT")
    private String royaltyTerms;

    @Column(name = "submitted_by_user_id")
    private Long submittedByUserId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public IntellectualPropertyRecord() {}

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
