package com.example.social_issues.auth.dto;

import com.example.social_issues.auth.model.EntityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SignupRequest {

    private EntityType entityType = EntityType.INDIVIDUAL;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be a valid 10-digit mobile number")
    private String phone;

    private String email;
    private String password;

    @NotBlank(message = "District is required")
    private String district;

    private String block;
    private String language;
    private String otp;

    // Group / SHG Fields
    private String groupName;
    private String leaderSpoc;
    private Integer memberCount;

    // Civic Organization / Panchayat Fields
    private String orgName;
    private String orgCode;
    private String nodalPerson;

    public SignupRequest() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
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
}
