package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.CorporateRole;
import jakarta.validation.constraints.NotNull;

public class UpdateTeamMemberRoleRequest {

    @NotNull(message = "Corporate role is required")
    private CorporateRole corporateRole;

    private String designation;
    private Boolean canCommitGrants;
    private Boolean canApproveDisbursements;
    private Boolean canManageTeam;
    private Boolean canEditProfile;
    private Boolean canVerifyUcs;

    public UpdateTeamMemberRoleRequest() {}

    public CorporateRole getCorporateRole() { return corporateRole; }
    public void setCorporateRole(CorporateRole corporateRole) { this.corporateRole = corporateRole; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

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
