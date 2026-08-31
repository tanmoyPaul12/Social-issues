package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "industry_team_members", indexes = {
    @Index(name = "idx_team_profile", columnList = "industry_profile_id"),
    @Index(name = "idx_team_email", columnList = "email"),
    @Index(name = "idx_team_token", columnList = "invitation_token")
})
public class IndustryTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "designation", length = 120)
    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(name = "corporate_role", nullable = false, length = 40)
    private CorporateRole corporateRole = CorporateRole.PROJECT_MANAGER;

    @Column(name = "can_commit_grants")
    private Boolean canCommitGrants = false;

    @Column(name = "can_approve_disbursements")
    private Boolean canApproveDisbursements = false;

    @Column(name = "can_manage_team")
    private Boolean canManageTeam = false;

    @Column(name = "can_edit_profile")
    private Boolean canEditProfile = false;

    @Column(name = "can_verify_ucs")
    private Boolean canVerifyUcs = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private TeamMemberStatus status = TeamMemberStatus.INVITED;

    @Column(name = "invitation_token", length = 100)
    private String invitationToken;

    @Column(name = "invited_by_user_id")
    private Long invitedByUserId;

    @Column(name = "invited_by_name", length = 120)
    private String invitedByName;

    @Column(name = "invited_at")
    private LocalDateTime invitedAt = LocalDateTime.now();

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public IndustryTeamMember() {}

    public IndustryTeamMember(
            IndustryProfile industryProfile,
            User user,
            String fullName,
            String email,
            String phone,
            String designation,
            CorporateRole corporateRole,
            TeamMemberStatus status,
            String invitationToken,
            Long invitedByUserId,
            String invitedByName
    ) {
        this.industryProfile = industryProfile;
        this.user = user;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.designation = designation;
        this.corporateRole = corporateRole;
        this.status = status;
        this.invitationToken = invitationToken;
        this.invitedByUserId = invitedByUserId;
        this.invitedByName = invitedByName;
        this.invitedAt = LocalDateTime.now();
        applyDefaultPermissionsForRole(corporateRole);
    }

    public void applyDefaultPermissionsForRole(CorporateRole role) {
        if (role == null) return;
        switch (role) {
            case CSR_ADMIN -> {
                this.canCommitGrants = true;
                this.canApproveDisbursements = true;
                this.canManageTeam = true;
                this.canEditProfile = true;
                this.canVerifyUcs = true;
            }
            case FINANCE_APPROVER -> {
                this.canCommitGrants = true;
                this.canApproveDisbursements = true;
                this.canManageTeam = false;
                this.canEditProfile = false;
                this.canVerifyUcs = true;
            }
            case PROJECT_MANAGER -> {
                this.canCommitGrants = false;
                this.canApproveDisbursements = false;
                this.canManageTeam = false;
                this.canEditProfile = false;
                this.canVerifyUcs = false;
            }
            case CSR_VIEWER -> {
                this.canCommitGrants = false;
                this.canApproveDisbursements = false;
                this.canManageTeam = false;
                this.canEditProfile = false;
                this.canVerifyUcs = false;
            }
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public Boolean getCanCommitGrants() { return canCommitGrants != null ? canCommitGrants : false; }
    public void setCanCommitGrants(Boolean canCommitGrants) { this.canCommitGrants = canCommitGrants; }

    public Boolean getCanApproveDisbursements() { return canApproveDisbursements != null ? canApproveDisbursements : false; }
    public void setCanApproveDisbursements(Boolean canApproveDisbursements) { this.canApproveDisbursements = canApproveDisbursements; }

    public Boolean getCanManageTeam() { return canManageTeam != null ? canManageTeam : false; }
    public void setCanManageTeam(Boolean canManageTeam) { this.canManageTeam = canManageTeam; }

    public Boolean getCanEditProfile() { return canEditProfile != null ? canEditProfile : false; }
    public void setCanEditProfile(Boolean canEditProfile) { this.canEditProfile = canEditProfile; }

    public Boolean getCanVerifyUcs() { return canVerifyUcs != null ? canVerifyUcs : false; }
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

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
