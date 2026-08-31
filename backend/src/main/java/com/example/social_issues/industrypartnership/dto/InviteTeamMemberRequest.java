package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.CorporateRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class InviteTeamMemberRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Valid corporate email is required")
    private String email;

    private String phone;
    private String designation;

    @NotNull(message = "Corporate role is required")
    private CorporateRole corporateRole = CorporateRole.PROJECT_MANAGER;

    private Boolean canCommitGrants;
    private Boolean canApproveDisbursements;
    private Boolean canManageTeam;
    private Boolean canEditProfile;
    private Boolean canVerifyUcs;

    public InviteTeamMemberRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public CorporateRole getCorporateRole() { return corporateRole; }
    public void setCorporateRole(CorporateRole corporateRole) { this.corporateRole = corporateRole; }

    public Boolean getCanCommitGrants() { return canCommitGrants; }
    public void setCanCommitGrants(Boolean canCommitGrants) { this.canCommitGrants = canCommitGrants; }

    public Boolean getCanApproveDisbursements() { return canApproveDisbursements; }
    public void setCanApproveDisbursements(Boolean canApproveDisbursements) { this.canApproveDisbursements = canApproveDisbursements; }

    public Boolean getCanManageTeam() { return canManageTeam; }
    public void setCanManageTeam(Boolean canManageTeam) { this.canManageTeam = canManageTeam; }

    public Boolean getCanEditProfile() { return canEditProfile; }
    public void setCanEditProfile(Boolean canEditProfile) { this.canEditProfile = canEditProfile; }

    public Boolean getCanVerifyUcs() { return canVerifyUcs; }
    public void setCanVerifyUcs(Boolean canVerifyUcs) { this.canVerifyUcs = canVerifyUcs; }
}
