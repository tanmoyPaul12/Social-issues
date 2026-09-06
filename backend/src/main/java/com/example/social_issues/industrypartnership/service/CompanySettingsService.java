package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.TeamMemberStatus;

import java.util.List;

public interface CompanySettingsService {

    CompanyProfileDto getCompanyProfile(Long userId);

    CompanyProfileDto updateCompanyProfile(Long userId, UpdateCompanyProfileRequest request);

    List<IndustryTeamMemberDto> getTeamMembers(Long userId);

    IndustryTeamMemberDto inviteTeamMember(Long userId, InviteTeamMemberRequest request);

    IndustryTeamMemberDto updateTeamMemberRole(Long userId, Long memberId, UpdateTeamMemberRoleRequest request);

    IndustryTeamMemberDto updateTeamMemberStatus(Long userId, Long memberId, TeamMemberStatus status);

    void deleteTeamMember(Long userId, Long memberId);

    IndustryTeamMemberDto resendInvitation(Long userId, Long memberId);

    IndustryTeamMemberDto acceptInvitation(Long userId, String invitationToken);

    CorporateNotificationPreferencesDto getNotificationPreferences(Long userId);

    CorporateNotificationPreferencesDto updateNotificationPreferences(Long userId, UpdateNotificationPreferencesRequest request);
}
