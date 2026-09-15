package com.example.social_issues.auth.dto;

import com.example.social_issues.auth.model.*;

public class UserSummaryDto {

    private String id;
    private EntityType entityType;
    private String name;
    private String phone;
    private String email;
    private String district;
    private String block;
    private String language;
    private Role role;
    private boolean verified;

    // Group / Org fields
    private String groupName;
    private String leaderSpoc;
    private Integer memberCount;
    private String orgName;
    private String orgCode;
    private String nodalPerson;

    // Institutional & Verification fields
    private String designation;
    private String aisheCode;
    private String gstin;
    private String cinNumber;
    private String csrNumber;
    private String referenceId;
    private VerificationStatus verificationStatus;

    public UserSummaryDto() {
    }

    public static UserSummaryDto fromEntity(User user) {
        return fromEntity(user, user.getRole());
    }

    public static UserSummaryDto fromEntity(User user, Role targetRole) {
        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(user.getId() != null ? String.valueOf(user.getId()) : null);
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setRole(targetRole != null ? targetRole : user.getRole());
        dto.setVerified(Boolean.TRUE.equals(user.getVerified()));
        dto.setReferenceId(user.getReferenceId());
        dto.setVerificationStatus(user.getVerificationStatus());

        Role effectiveRole = targetRole != null ? targetRole : user.getRole();

        if (effectiveRole == Role.UNIVERSITY && user.getUniversityProfile() != null) {
            UniversityProfile up = user.getUniversityProfile();
            dto.setEntityType(EntityType.ORGANIZATION);
            dto.setOrgName(up.getUnivName());
            dto.setAisheCode(up.getAisheCode());
            dto.setDesignation(up.getDesignation());
            dto.setDistrict(up.getDistrict());
            dto.setNodalPerson(up.getNodalSpocName());
        } else if (effectiveRole == Role.INDUSTRY && user.getIndustryProfile() != null) {
            IndustryProfile ip = user.getIndustryProfile();
            dto.setEntityType(EntityType.ORGANIZATION);
            dto.setOrgName(ip.getCompanyName());
            dto.setGstin(ip.getGstin());
            dto.setCinNumber(ip.getCinNumber());
            dto.setCsrNumber(ip.getCsrNumber());
            dto.setDesignation(ip.getDesignation());
            dto.setDistrict(ip.getDistrict());
            dto.setNodalPerson(ip.getSpocName());
        } else if (effectiveRole == Role.GOVERNMENT && user.getGovernmentProfile() != null) {
            GovernmentProfile gp = user.getGovernmentProfile();
            dto.setEntityType(EntityType.ORGANIZATION);
            dto.setOrgName(gp.getDeptName());
            dto.setOrgCode(gp.getServiceCode());
            dto.setDesignation(gp.getDesignation());
            dto.setDistrict(gp.getDistrict());
            dto.setNodalPerson(gp.getNodalOfficerName());
        } else if (user.getCitizenProfile() != null) {
            CitizenProfile cp = user.getCitizenProfile();
            dto.setEntityType(cp.getEntityType());
            dto.setDistrict(cp.getDistrict());
            dto.setBlock(cp.getBlock());
            dto.setLanguage(cp.getLanguage());
            dto.setGroupName(cp.getGroupName());
            dto.setLeaderSpoc(cp.getLeaderSpoc());
            dto.setMemberCount(cp.getMemberCount());
            dto.setOrgName(cp.getOrgName());
            dto.setOrgCode(cp.getOrgCode());
            dto.setNodalPerson(cp.getNodalPerson());
        } else if (user.getUniversityProfile() != null) {
            UniversityProfile up = user.getUniversityProfile();
            dto.setEntityType(EntityType.ORGANIZATION);
            dto.setOrgName(up.getUnivName());
            dto.setAisheCode(up.getAisheCode());
            dto.setDesignation(up.getDesignation());
            dto.setDistrict(up.getDistrict());
            dto.setNodalPerson(up.getNodalSpocName());
        } else if (user.getIndustryProfile() != null) {
            IndustryProfile ip = user.getIndustryProfile();
            dto.setEntityType(EntityType.ORGANIZATION);
            dto.setOrgName(ip.getCompanyName());
            dto.setGstin(ip.getGstin());
            dto.setCinNumber(ip.getCinNumber());
            dto.setCsrNumber(ip.getCsrNumber());
            dto.setDesignation(ip.getDesignation());
            dto.setDistrict(ip.getDistrict());
            dto.setNodalPerson(ip.getSpocName());
        }

        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setRole(String role) {
        if (role == null) {
            this.role = null;
            return;
        }
        try {
            this.role = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            this.role = null;
        }
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getLeaderSpoc() {
        return leaderSpoc;
    }

    public void setLeaderSpoc(String leaderSpoc) {
        this.leaderSpoc = leaderSpoc;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getOrgCode() {
        return orgCode;
    }

    public void setOrgCode(String orgCode) {
        this.orgCode = orgCode;
    }

    public String getNodalPerson() {
        return nodalPerson;
    }

    public void setNodalPerson(String nodalPerson) {
        this.nodalPerson = nodalPerson;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getAisheCode() {
        return aisheCode;
    }

    public void setAisheCode(String aisheCode) {
        this.aisheCode = aisheCode;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public String getCinNumber() {
        return cinNumber;
    }

    public void setCinNumber(String cinNumber) {
        this.cinNumber = cinNumber;
    }

    public String getCsrNumber() {
        return csrNumber;
    }

    public void setCsrNumber(String csrNumber) {
        this.csrNumber = csrNumber;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}
