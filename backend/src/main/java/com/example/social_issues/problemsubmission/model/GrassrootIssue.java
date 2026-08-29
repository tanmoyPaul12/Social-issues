package com.example.social_issues.problemsubmission.model;

import com.example.social_issues.auth.model.EntityType;
import com.example.social_issues.auth.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "grassroot_issues", indexes = {
    @Index(name = "idx_issues_submitter_id", columnList = "submitter_id"),
    @Index(name = "idx_issues_status", columnList = "status"),
    @Index(name = "idx_issues_district", columnList = "district"),
    @Index(name = "idx_issues_sector", columnList = "sector"),
    @Index(name = "idx_issues_number", columnList = "issue_number")
})
public class GrassrootIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "issue_number", unique = true, nullable = false, length = 40)
    private String issueNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitter_id", nullable = false)
    private User submitter;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "sector", nullable = false, length = 50)
    private IssueSector sector = IssueSector.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(name = "submitter_entity_type", nullable = false, length = 50)
    private EntityType submitterEntityType = EntityType.INDIVIDUAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private IssueStatus status = IssueStatus.SUBMITTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 50)
    private IssuePriority priority = IssuePriority.MEDIUM;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "block", length = 100)
    private String block;

    @Column(name = "village_or_ward", length = 150)
    private String villageOrWard;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "address_description", columnDefinition = "TEXT")
    private String addressDescription;

    @Column(name = "affected_population")
    private Integer affectedPopulation;

    @Column(name = "estimated_impact_score")
    private Integer estimatedImpactScore;

    @Column(name = "contact_name", length = 150)
    private String contactName;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<IssueAttachment> attachments = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public GrassrootIssue() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIssueNumber() { return issueNumber; }
    public void setIssueNumber(String issueNumber) { this.issueNumber = issueNumber; }

    public User getSubmitter() { return submitter; }
    public void setSubmitter(User submitter) { this.submitter = submitter; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public EntityType getSubmitterEntityType() { return submitterEntityType; }
    public void setSubmitterEntityType(EntityType submitterEntityType) { this.submitterEntityType = submitterEntityType; }

    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }

    public IssuePriority getPriority() { return priority; }
    public void setPriority(IssuePriority priority) { this.priority = priority; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getVillageOrWard() { return villageOrWard; }
    public void setVillageOrWard(String villageOrWard) { this.villageOrWard = villageOrWard; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }

    public Integer getAffectedPopulation() { return affectedPopulation; }
    public void setAffectedPopulation(Integer affectedPopulation) { this.affectedPopulation = affectedPopulation; }

    public Integer getEstimatedImpactScore() { return estimatedImpactScore; }
    public void setEstimatedImpactScore(Integer estimatedImpactScore) { this.estimatedImpactScore = estimatedImpactScore; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean anonymous) { isAnonymous = anonymous; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public List<IssueAttachment> getAttachments() { return attachments; }
    public void setAttachments(List<IssueAttachment> attachments) { this.attachments = attachments; }

    public void addAttachment(IssueAttachment attachment) {
        attachments.add(attachment);
        attachment.setIssue(this);
    }

    public void removeAttachment(IssueAttachment attachment) {
        attachments.remove(attachment);
        attachment.setIssue(null);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
