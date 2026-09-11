package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.model.User;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.auth.repository.UserRepository;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.*;
import com.example.social_issues.industrypartnership.repository.*;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CompanySettingsServiceImpl implements CompanySettingsService {

    private static final Logger log = LoggerFactory.getLogger(CompanySettingsServiceImpl.class);

    private final IndustryProfileRepository industryProfileRepository;
    private final IndustryTeamMemberRepository industryTeamMemberRepository;
    private final CorporateNotificationPreferenceRepository notificationPreferenceRepository;
    private final CoFundedPilotRepository coFundedPilotRepository;
    private final UserRepository userRepository;
    private final NotificationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    public CompanySettingsServiceImpl(
            IndustryProfileRepository industryProfileRepository,
            IndustryTeamMemberRepository industryTeamMemberRepository,
            CorporateNotificationPreferenceRepository notificationPreferenceRepository,
            CoFundedPilotRepository coFundedPilotRepository,
            UserRepository userRepository,
            NotificationEventPublisher eventPublisher,
            ObjectMapper objectMapper
    ) {
        this.industryProfileRepository = industryProfileRepository;
        this.industryTeamMemberRepository = industryTeamMemberRepository;
        this.notificationPreferenceRepository = notificationPreferenceRepository;
        this.coFundedPilotRepository = coFundedPilotRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
        this.objectMapper = objectMapper;
    }

    private IndustryProfile resolveProfile(Long userId) {
        // 1. Direct match with primary account owner
        Optional<IndustryProfile> ownerProfile = industryProfileRepository.findByUserId(userId);
        if (ownerProfile.isPresent()) {
            return ownerProfile.get();
        }

        // 2. Match with team member account
        Optional<IndustryTeamMember> member = industryTeamMemberRepository.findByUserId(userId);
        if (member.isPresent()) {
            return member.get().getIndustryProfile();
        }

        // 3. Fallback to first available industry profile (dev / seed environment fallback)
        List<IndustryProfile> list = industryProfileRepository.findAll();
        if (!list.isEmpty()) {
            return list.get(0);
        }

        throw new IllegalArgumentException("Industry profile context not found for user: " + userId);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyProfileDto getCompanyProfile(Long userId) {
        IndustryProfile profile = resolveProfile(userId);
        int teamCount = (int) industryTeamMemberRepository.countByIndustryProfileIdAndStatus(profile.getId(), TeamMemberStatus.ACTIVE);
        int pilotCount = coFundedPilotRepository.findByIndustryProfileId(profile.getId()).size();

        return CompanyProfileDto.fromEntity(profile, teamCount, pilotCount);
    }

    @Override
    @Transactional
    public CompanyProfileDto updateCompanyProfile(Long userId, UpdateCompanyProfileRequest request) {
        IndustryProfile profile = resolveProfile(userId);

        profile.setCompanyName(request.getCompanyName());
        if (request.getCompanyType() != null) profile.setCompanyType(request.getCompanyType());
        if (request.getPartnerCategory() != null) profile.setPartnerCategory(request.getPartnerCategory());
        if (request.getDpiitRecognitionNumber() != null) profile.setDpiitRecognitionNumber(request.getDpiitRecognitionNumber());
        if (request.getUdyamRegistrationNumber() != null) profile.setUdyamRegistrationNumber(request.getUdyamRegistrationNumber());
        if (request.getTaxExemptionNumber() != null) profile.setTaxExemptionNumber(request.getTaxExemptionNumber());
        if (request.getInstitutionRegNumber() != null) profile.setInstitutionRegNumber(request.getInstitutionRegNumber());
        if (request.getGstin() != null) profile.setGstin(request.getGstin());
        if (request.getCinNumber() != null) profile.setCinNumber(request.getCinNumber());
        if (request.getCsrNumber() != null) profile.setCsrNumber(request.getCsrNumber());
        if (request.getPanNumber() != null) profile.setPanNumber(request.getPanNumber());

        if (request.getRegisteredAddress() != null) profile.setRegisteredAddress(request.getRegisteredAddress());
        if (request.getState() != null) profile.setState(request.getState());
        if (request.getDistrict() != null) profile.setDistrict(request.getDistrict());
        if (request.getPincode() != null) profile.setPincode(request.getPincode());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getContactEmail() != null) profile.setContactEmail(request.getContactEmail());
        if (request.getContactPhone() != null) profile.setContactPhone(request.getContactPhone());

        if (request.getAnnualCsrBudget() != null) profile.setAnnualCsrBudget(request.getAnnualCsrBudget());
        if (request.getCompanyScale() != null) profile.setCompanyScale(request.getCompanyScale());
        if (request.getAboutCompany() != null) profile.setAboutCompany(request.getAboutCompany());

        if (request.getSpocName() != null) profile.setSpocName(request.getSpocName());
        if (request.getDesignation() != null) profile.setDesignation(request.getDesignation());

        if (request.getSectors() != null && !request.getSectors().isEmpty()) {
            profile.setSectors(String.join(", ", request.getSectors()));
        }

        profile = industryProfileRepository.save(profile);

        // Publish update event
        publishCorporateEvent(
                "COMPANY_PROFILE_UPDATED",
                "Corporate Profile Updated",
                "Statutory particulars for " + profile.getCompanyName() + " updated by User " + userId,
                profile.getId(),
                "INDUSTRY_PROFILE"
        );

        int teamCount = (int) industryTeamMemberRepository.countByIndustryProfileIdAndStatus(profile.getId(), TeamMemberStatus.ACTIVE);
        int pilotCount = coFundedPilotRepository.findByIndustryProfileId(profile.getId()).size();

        return CompanyProfileDto.fromEntity(profile, teamCount, pilotCount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IndustryTeamMemberDto> getTeamMembers(Long userId) {
        IndustryProfile profile = resolveProfile(userId);
        List<IndustryTeamMember> members = industryTeamMemberRepository.findByIndustryProfileIdOrderByCreatedAtAsc(profile.getId());

        // If no members exist yet, create default primary SPOC member representation
        if (members.isEmpty() && profile.getUser() != null) {
            IndustryTeamMember primaryOwner = new IndustryTeamMember(
                    profile,
                    profile.getUser(),
                    profile.getSpocName() != null ? profile.getSpocName() : profile.getUser().getName(),
                    profile.getContactEmail() != null ? profile.getContactEmail() : profile.getUser().getEmail(),
                    profile.getContactPhone() != null ? profile.getContactPhone() : profile.getUser().getPhone(),
                    profile.getDesignation() != null ? profile.getDesignation() : "Head of CSR & Primary SPOC",
                    CorporateRole.CSR_ADMIN,
                    TeamMemberStatus.ACTIVE,
                    null,
                    profile.getUser().getId(),
                    "System"
            );
            primaryOwner.setJoinedAt(profile.getCreatedAt());
            primaryOwner = industryTeamMemberRepository.save(primaryOwner);
            members = List.of(primaryOwner);
        }

        return members.stream().map(IndustryTeamMemberDto::fromEntity).toList();
    }

    @Override
    @Transactional
    public IndustryTeamMemberDto inviteTeamMember(Long userId, InviteTeamMemberRequest request) {
        IndustryProfile profile = resolveProfile(userId);

        if (industryTeamMemberRepository.existsByIndustryProfileIdAndEmail(profile.getId(), request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("A team member with email " + request.getEmail() + " is already registered under this company.");
        }

        String inviterName = profile.getUser() != null ? profile.getUser().getName() : "CSR Administrator";
        String token = UUID.randomUUID().toString();

        // Check if an existing User already exists with this email
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail().trim().toLowerCase());

        IndustryTeamMember member = new IndustryTeamMember(
                profile,
                existingUser.orElse(null),
                request.getFullName().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPhone(),
                request.getDesignation(),
                request.getCorporateRole() != null ? request.getCorporateRole() : CorporateRole.PROJECT_MANAGER,
                existingUser.isPresent() ? TeamMemberStatus.ACTIVE : TeamMemberStatus.INVITED,
                token,
                userId,
                inviterName
        );

        if (request.getCanCommitGrants() != null) member.setCanCommitGrants(request.getCanCommitGrants());
        if (request.getCanApproveDisbursements() != null) member.setCanApproveDisbursements(request.getCanApproveDisbursements());
        if (request.getCanManageTeam() != null) member.setCanManageTeam(request.getCanManageTeam());
        if (request.getCanEditProfile() != null) member.setCanEditProfile(request.getCanEditProfile());
        if (request.getCanVerifyUcs() != null) member.setCanVerifyUcs(request.getCanVerifyUcs());

        if (existingUser.isPresent()) {
            member.setJoinedAt(LocalDateTime.now());
        }

        member = industryTeamMemberRepository.save(member);

        // Publish event
        publishCorporateEvent(
                "TEAM_MEMBER_INVITED",
                "New Corporate Member Invited",
                request.getFullName() + " (" + request.getEmail() + ") invited as " + member.getCorporateRole(),
                member.getId(),
                "TEAM_MEMBER"
        );

        log.info("Corporate invitation generated for email: {} with token: {}", request.getEmail(), token);

        return IndustryTeamMemberDto.fromEntity(member);
    }

    @Override
    @Transactional
    public IndustryTeamMemberDto updateTeamMemberRole(Long userId, Long memberId, UpdateTeamMemberRoleRequest request) {
        IndustryProfile profile = resolveProfile(userId);
        IndustryTeamMember member = industryTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + memberId));

        if (!member.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to company team member.");
        }

        member.setCorporateRole(request.getCorporateRole());
        member.applyDefaultPermissionsForRole(request.getCorporateRole());

        if (request.getDesignation() != null) member.setDesignation(request.getDesignation());
        if (request.getCanCommitGrants() != null) member.setCanCommitGrants(request.getCanCommitGrants());
        if (request.getCanApproveDisbursements() != null) member.setCanApproveDisbursements(request.getCanApproveDisbursements());
        if (request.getCanManageTeam() != null) member.setCanManageTeam(request.getCanManageTeam());
        if (request.getCanEditProfile() != null) member.setCanEditProfile(request.getCanEditProfile());
        if (request.getCanVerifyUcs() != null) member.setCanVerifyUcs(request.getCanVerifyUcs());

        member = industryTeamMemberRepository.save(member);

        publishCorporateEvent(
                "TEAM_MEMBER_ROLE_UPDATED",
                "Corporate Role Updated",
                "Role for " + member.getFullName() + " updated to " + member.getCorporateRole(),
                member.getId(),
                "TEAM_MEMBER"
        );

        return IndustryTeamMemberDto.fromEntity(member);
    }

    @Override
    @Transactional
    public IndustryTeamMemberDto updateTeamMemberStatus(Long userId, Long memberId, TeamMemberStatus status) {
        IndustryProfile profile = resolveProfile(userId);
        IndustryTeamMember member = industryTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + memberId));

        if (!member.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to company team member.");
        }

        member.setStatus(status);
        member = industryTeamMemberRepository.save(member);

        publishCorporateEvent(
                "TEAM_MEMBER_STATUS_CHANGED",
                "Member Status Updated",
                member.getFullName() + " status set to " + status,
                member.getId(),
                "TEAM_MEMBER"
        );

        return IndustryTeamMemberDto.fromEntity(member);
    }

    @Override
    @Transactional
    public void deleteTeamMember(Long userId, Long memberId) {
        IndustryProfile profile = resolveProfile(userId);
        IndustryTeamMember member = industryTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + memberId));

        if (!member.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to company team member.");
        }

        // Prevent deleting the last CSR_ADMIN
        if (member.getCorporateRole() == CorporateRole.CSR_ADMIN) {
            long adminCount = industryTeamMemberRepository.countByIndustryProfileIdAndRole(profile.getId(), CorporateRole.CSR_ADMIN);
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot remove the sole CSR Administrator from corporate account.");
            }
        }

        industryTeamMemberRepository.delete(member);

        publishCorporateEvent(
                "TEAM_MEMBER_REMOVED",
                "Team Member Removed",
                member.getFullName() + " was removed from corporate workspace",
                profile.getId(),
                "INDUSTRY_PROFILE"
        );
    }

    @Override
    @Transactional
    public IndustryTeamMemberDto resendInvitation(Long userId, Long memberId) {
        IndustryProfile profile = resolveProfile(userId);
        IndustryTeamMember member = industryTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + memberId));

        if (!member.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to company team member.");
        }

        String newToken = UUID.randomUUID().toString();
        member.setInvitationToken(newToken);
        member.setInvitedAt(LocalDateTime.now());
        member.setStatus(TeamMemberStatus.INVITED);
        member = industryTeamMemberRepository.save(member);

        log.info("Resent invitation token for {} -> {}", member.getEmail(), newToken);

        return IndustryTeamMemberDto.fromEntity(member);
    }

    @Override
    @Transactional
    public IndustryTeamMemberDto acceptInvitation(Long userId, String invitationToken) {
        IndustryTeamMember member = industryTeamMemberRepository.findByInvitationToken(invitationToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired invitation token."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + userId));

        member.setUser(user);
        member.setStatus(TeamMemberStatus.ACTIVE);
        member.setJoinedAt(LocalDateTime.now());
        member.setInvitationToken(null);
        member = industryTeamMemberRepository.save(member);

        publishCorporateEvent(
                "TEAM_INVITATION_ACCEPTED",
                "Corporate Invitation Accepted",
                member.getFullName() + " joined corporate workspace " + member.getIndustryProfile().getCompanyName(),
                member.getId(),
                "TEAM_MEMBER"
        );

        return IndustryTeamMemberDto.fromEntity(member);
    }

    @Override
    @Transactional
    public CorporateNotificationPreferencesDto getNotificationPreferences(Long userId) {
        IndustryProfile profile = resolveProfile(userId);

        CorporateNotificationPreference pref = notificationPreferenceRepository
                .findByIndustryProfileId(profile.getId())
                .orElseGet(() -> {
                    CorporateNotificationPreference newPref = new CorporateNotificationPreference(profile);
                    return notificationPreferenceRepository.save(newPref);
                });

        return CorporateNotificationPreferencesDto.fromEntity(pref, objectMapper);
    }

    @Override
    @Transactional
    public CorporateNotificationPreferencesDto updateNotificationPreferences(
            Long userId,
            UpdateNotificationPreferencesRequest request
    ) {
        IndustryProfile profile = resolveProfile(userId);

        CorporateNotificationPreference pref = notificationPreferenceRepository
                .findByIndustryProfileId(profile.getId())
                .orElseGet(() -> new CorporateNotificationPreference(profile));

        if (request.getPreferredSectors() != null) {
            try {
                pref.setPreferredSectorsJson(objectMapper.writeValueAsString(request.getPreferredSectors()));
            } catch (Exception e) {
                pref.setPreferredSectorsJson("[\"" + String.join("\",\"", request.getPreferredSectors()) + "\"]");
            }
        }
        if (request.getMinReadinessLevel() != null) pref.setMinReadinessLevel(request.getMinReadinessLevel());
        if (request.getNotifyNewMatchingProjects() != null) pref.setNotifyNewMatchingProjects(request.getNotifyNewMatchingProjects());
        if (request.getNotifyMilestoneSubmissions() != null) pref.setNotifyMilestoneSubmissions(request.getNotifyMilestoneSubmissions());
        if (request.getNotifyDisbursementTrancheDue() != null) pref.setNotifyDisbursementTrancheDue(request.getNotifyDisbursementTrancheDue());
        if (request.getNotifyComplianceDeadlines() != null) pref.setNotifyComplianceDeadlines(request.getNotifyComplianceDeadlines());
        if (request.getNotifyDiscussionMessages() != null) pref.setNotifyDiscussionMessages(request.getNotifyDiscussionMessages());
        if (request.getEmailDigestFrequency() != null) pref.setEmailDigestFrequency(request.getEmailDigestFrequency());
        if (request.getAlertEmail() != null) pref.setAlertEmail(request.getAlertEmail());

        pref = notificationPreferenceRepository.save(pref);

        publishCorporateEvent(
                "NOTIFICATION_PREFERENCES_UPDATED",
                "Corporate Alert Rules Updated",
                "Research domain subscriptions & alert toggles updated for " + profile.getCompanyName(),
                pref.getId(),
                "NOTIFICATION_PREFERENCES"
        );

        return CorporateNotificationPreferencesDto.fromEntity(pref, objectMapper);
    }

    private void publishCorporateEvent(String type, String title, String message, Long entityId, String entityType) {
        try {
            NotificationEvent event = new NotificationEvent();
            event.setEventType(type);
            event.setTitle(title);
            event.setMessage(message);
            event.setSource("backend.company_settings");
            event.setRecipientUserType("INDUSTRY_PARTNER");
            event.setReferenceEntityId(entityId);
            event.setReferenceEntityType(entityType);
            event.setSeverity("INFO");
            eventPublisher.publishIndustryNotification(event);
        } catch (Exception e) {
            log.warn("Failed to publish corporate event: {}", e.getMessage());
        }
    }
}
