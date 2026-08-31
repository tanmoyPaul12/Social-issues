package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.CorporateRole;
import com.example.social_issues.industrypartnership.model.IndustryTeamMember;
import com.example.social_issues.industrypartnership.model.TeamMemberStatus;
import java.time.LocalDateTime;

public class IndustryTeamMemberDto {

    private Long id;
    private Long industryProfileId;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String designation;

    private CorporateRole corporateRole;
    private String roleDescription;

    private Boolean canCommitGrants;
    private Boolean canApproveDisbursements;
    private Boolean canManageTeam;
    private Boolean canEditProfile;
    private Boolean canVerifyUcs;

    private TeamMemberStatus status;
    private String invitationToken;
    private Long invitedByUserId;
    private String invitedByName;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
    private LocalDateTime lastActiveAt;
    private LocalDateTime createdAt;

    public IndustryTeamMemberDto() {}

    public static IndustryTeamMemberDto fromEntity(IndustryTeamMember m) {
        IndustryTeamMemberDto dto = new IndustryTeamMemberDto();
        dto.setId(m.getId());
        if (m.getIndustryProfile() != null) {
            dto.setIndustryProfileId(m.getIndustryProfile().getId());
        }
        if (m.getUser() != null) {
            dto.setUserId(m.getUser().getId());
        }
        dto.setFullName(m.getFullName());
        dto.setEmail(m.getEmail());
        dto.setPhone(m.getPhone());
        dto.setDesignation(m.getDesignation());
        dto.setCorporateRole(m.getCorporateRole());
        dto.setRoleDescription(m.getCorporateRole() != null ? m.getCorporateRole().getDescription() : "");

        dto.setCanCommitGrants(m.getCanCommitGrants());
        dto.setCanApproveDisbursements(m.getCanApproveDisbursements());
        dto.setCanManageTeam(m.getCanManageTeam());
        dto.setCanEditProfile(m.getCanEditProfile());
        dto.setCanVerifyUcs(m.getCanVerifyUcs());

        dto.setStatus(m.getStatus());
        dto.setInvitationToken(m.getInvitationToken());
        dto.setInvitedByUserId(m.getInvitedByUserId());
        dto.setInvitedByName(m.getInvitedByName());
        dto.setInvitedAt(m.getInvitedAt());
        dto.setJoinedAt(m.getJoinedAt());
        dto.setLastActiveAt(m.getLastActiveAt());
        dto.setCreatedAt(m.getCreatedAt());

        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIndustryProfileId() { return industryProfileId; }
    public void setIndustryProfileId(Long industryProfileId) { this.industryProfileId = industryProfileId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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

    public String getRoleDescription() { return roleDescription; }
    public void setRoleDescription(String roleDescription) { this.roleDescription = roleDescription; }

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

    public TeamMemberStatus getStatus() { return status; }
    public void setStatus(TeamMemberStatus status) { this.status = status; }

    public String getInvitationToken() { return invitationToken; }
    public void setInvitationToken(String invitationToken) { this.invitationToken = invitationToken; }

    public Long getInvitedByUserId() { return invitedByUserId; }
    public void setInvitedByUserId(Long invitedByUserId) { this.invitedByUserId = invitedByUserId; }

    public String getInvitedByName() { return invitedByName; }
    public void setInvitedByName(String invitedByName) { this.invitedByName = invitedByName; }

    public LocalDateTime getInvitedAt() { return invitedAt; }
    public void setInvitedAt(LocalDateTime invitedAt) { this.invitedAt = invitedAt; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
