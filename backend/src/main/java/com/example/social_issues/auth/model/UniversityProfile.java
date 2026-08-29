package com.example.social_issues.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "university_profiles")
public class UniversityProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "univ_name", nullable = false)
    private String univName;

    @Column(name = "aishe_code", length = 50, nullable = false)
    private String aisheCode;

    @Column(name = "univ_category", length = 100)
    private String univCategory;

    @Column(name = "nodal_spoc_name")
    private String nodalSpocName;

    @Column(name = "designation", length = 120)
    private String designation;

    @Column(name = "district", length = 80)
    private String district;

    @Column(name = "disciplines", length = 800)
    private String disciplines;

    @Column(name = "has_incubation_center")
    private Boolean hasIncubationCenter = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UniversityProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getUnivName() { return univName; }
    public void setUnivName(String univName) { this.univName = univName; }

    public String getAisheCode() { return aisheCode; }
    public void setAisheCode(String aisheCode) { this.aisheCode = aisheCode; }

    public String getUnivCategory() { return univCategory; }
    public void setUnivCategory(String univCategory) { this.univCategory = univCategory; }

    public String getNodalSpocName() { return nodalSpocName; }
    public void setNodalSpocName(String nodalSpocName) { this.nodalSpocName = nodalSpocName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getDisciplines() { return disciplines; }
    public void setDisciplines(String disciplines) { this.disciplines = disciplines; }

    public Boolean getHasIncubationCenter() { return hasIncubationCenter; }
    public void setHasIncubationCenter(Boolean hasIncubationCenter) { this.hasIncubationCenter = hasIncubationCenter; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
