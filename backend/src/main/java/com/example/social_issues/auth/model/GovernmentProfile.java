package com.example.social_issues.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "government_profiles")
public class GovernmentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "dept_name", nullable = false)
    private String deptName;

    @Column(name = "service_code", length = 50, nullable = false)
    private String serviceCode;

    @Column(name = "nodal_officer_name")
    private String nodalOfficerName;

    @Column(name = "designation", length = 120)
    private String designation;

    @Column(name = "district", length = 80)
    private String district;

    @Column(name = "panchayat_code", length = 50)
    private String panchayatCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public GovernmentProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDeptName() { return deptName; }
    public void setDeptName(String deptName) { this.deptName = deptName; }

    public String getServiceCode() { return serviceCode; }
    public void setServiceCode(String serviceCode) { this.serviceCode = serviceCode; }

    public String getNodalOfficerName() { return nodalOfficerName; }
    public void setNodalOfficerName(String nodalOfficerName) { this.nodalOfficerName = nodalOfficerName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getPanchayatCode() { return panchayatCode; }
    public void setPanchayatCode(String panchayatCode) { this.panchayatCode = panchayatCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
