package com.example.social_issues.universitycollab.service;

import com.example.social_issues.universitycollab.dto.*;

import java.util.List;

public interface UniversityCollabService {

    List<RoutedChallengeDto> getRoutedChallenges(String aisheCode);

    List<RoutedChallengeDto> getAllOpenChallenges(String sector, String district);

    ChallengeClaimResponse claimChallenge(ChallengeClaimRequest request);

    List<ChallengeClaimResponse> getMyClaims(String aisheCode);

    UniversityProjectResponse createProject(CreateUniversityProjectRequest request);

    List<UniversityProjectResponse> getUniversityProjects(String aisheCode);

    UniversityProjectResponse getProjectById(Long id);

    UniversityProjectResponse updateProjectStage(Long id, UpdateProjectStageRequest request);

    TeamMemberDto addTeamMember(Long projectId, TeamMemberDto memberDto);

    void removeTeamMember(Long projectId, Long memberId);

    List<IndustryOfferDto> getIndustryOffers(String aisheCode);
}
