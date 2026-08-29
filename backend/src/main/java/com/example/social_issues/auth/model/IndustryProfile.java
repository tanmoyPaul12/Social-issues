package com.example.social_issues.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "industry_profiles")
public class IndustryProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_type", length = 80)
    private String companyType;

    @Column(name = "gstin", length = 50, nullable = false)
    private String gstin;

    @Column(name = "cin_number", length = 50)
    private String cinNumber;

    @Column(name = "csr_number", length = 50)
    private String csrNumber;

    @Column(name = "spoc_name")
    private String spocName;

    @Column(name = "designation", length = 120)
    private String designation;

    @Column(name = "district", length = 80)
    private String district;

    @Column(name = "sectors", length = 800)
    private String sectors;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public IndustryProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyType() { return companyType; }
    public void setCompanyType(String companyType) { this.companyType = companyType; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public String getCinNumber() { return cinNumber; }
    public void setCinNumber(String cinNumber) { this.cinNumber = cinNumber; }

    public String getCsrNumber() { return csrNumber; }
    public void setCsrNumber(String csrNumber) { this.csrNumber = csrNumber; }

    public String getSpocName() { return spocName; }
    public void setSpocName(String spocName) { this.spocName = spocName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getSectors() { return sectors; }
    public void setSectors(String sectors) { this.sectors = sectors; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
