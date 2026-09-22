package com.example.social_issues.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_phone", columnList = "phone")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone", unique = true, length = 30)
    private String phone;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.CITIZEN;

    @Column(name = "reference_id", length = 60)
    private String referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private VerificationStatus verificationStatus = VerificationStatus.APPROVED;

    @Column(name = "is_verified")
    private Boolean verified = true;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private CitizenProfile citizenProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UniversityProfile universityProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private IndustryProfile industryProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private GovernmentProfile governmentProfile;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPhoneNumber() { return phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public CitizenProfile getCitizenProfile() { return citizenProfile; }
    public void setCitizenProfile(CitizenProfile citizenProfile) {
        this.citizenProfile = citizenProfile;
        if (citizenProfile != null) citizenProfile.setUser(this);
    }

    public UniversityProfile getUniversityProfile() { return universityProfile; }
    public void setUniversityProfile(UniversityProfile universityProfile) {
        this.universityProfile = universityProfile;
        if (universityProfile != null) universityProfile.setUser(this);
    }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) {
        this.industryProfile = industryProfile;
        if (industryProfile != null) industryProfile.setUser(this);
    }

    public GovernmentProfile getGovernmentProfile() { return governmentProfile; }
    public void setGovernmentProfile(GovernmentProfile governmentProfile) {
        this.governmentProfile = governmentProfile;
        if (governmentProfile != null) governmentProfile.setUser(this);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Transient
    public EntityType getEntityType() {
        if (citizenProfile != null && citizenProfile.getEntityType() != null) {
            return citizenProfile.getEntityType();
        }
        if (universityProfile != null || industryProfile != null || governmentProfile != null) {
            return EntityType.ORGANIZATION;
        }
        return EntityType.INDIVIDUAL;
    }

    @Transient
    public String getDistrict() {
        if (citizenProfile != null && citizenProfile.getDistrict() != null) {
            return citizenProfile.getDistrict();
        }
        if (universityProfile != null && universityProfile.getDistrict() != null) {
            return universityProfile.getDistrict();
        }
        if (industryProfile != null && industryProfile.getDistrict() != null) {
            return industryProfile.getDistrict();
        }
        if (governmentProfile != null && governmentProfile.getDistrict() != null) {
            return governmentProfile.getDistrict();
        }
        return "";
    }
}
