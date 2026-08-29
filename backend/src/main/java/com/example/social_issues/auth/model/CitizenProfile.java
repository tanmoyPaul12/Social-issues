package com.example.social_issues.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "citizen_profiles")
public class CitizenProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type")
    private EntityType entityType = EntityType.INDIVIDUAL;

    @Column(name = "district", length = 80)
    private String district;

    @Column(name = "block", length = 80)
    private String block;

    @Column(name = "language", length = 80)
    private String language;

    // Group / SHG Fields
    @Column(name = "group_name")
    private String groupName;

    @Column(name = "leader_spoc")
    private String leaderSpoc;

    @Column(name = "member_count")
    private Integer memberCount;

    // Panchayat / Civic Org Fields
    @Column(name = "org_name")
    private String orgName;

    @Column(name = "org_code", length = 80)
    private String orgCode;

    @Column(name = "nodal_person")
    private String nodalPerson;

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

    public CitizenProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public EntityType getEntityType() { return entityType; }
    public void setEntityType(EntityType entityType) { this.entityType = entityType; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getLeaderSpoc() { return leaderSpoc; }
    public void setLeaderSpoc(String leaderSpoc) { this.leaderSpoc = leaderSpoc; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public String getOrgName() { return orgName; }
    public void setOrgName(String orgName) { this.orgName = orgName; }

    public String getOrgCode() { return orgCode; }
    public void setOrgCode(String orgCode) { this.orgCode = orgCode; }

    public String getNodalPerson() { return nodalPerson; }
    public void setNodalPerson(String nodalPerson) { this.nodalPerson = nodalPerson; }

    public String getPanchayatCode() { return panchayatCode; }
    public void setPanchayatCode(String panchayatCode) { this.panchayatCode = panchayatCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
