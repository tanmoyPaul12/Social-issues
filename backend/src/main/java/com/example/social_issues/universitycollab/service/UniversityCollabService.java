package com.example.social_issues.universitycollab.service;

import com.example.social_issues.universitycollab.dto.*;

import java.util.List;

public interface UniversityCollabService {

    List<RoutedChallengeDto> getRoutedChallenges(String aisheCode);

    List<RoutedChallengeDto> getChallengesForUniversity(String assignedTo, String aisheCode);

    List<RoutedChallengeDto> getAllOpenChallenges(String sector, String district);

    ChallengeClaimResponse claimChallenge(ChallengeClaimRequest request);

    List<ChallengeClaimResponse> getMyClaims(String aisheCode);

    UniversityProjectResponse createProject(CreateUniversityProjectRequest request);

    UniversityProjectResponse acceptChallenge(Long issueId, CreateUniversityProjectRequest request);

    void declineChallenge(Long issueId, DeclineChallengeRequest request);

    List<UniversityProjectResponse> getUniversityProjects(String aisheCode);

    UniversityProjectResponse getProjectById(Long id);

    UniversityProjectResponse updateProjectStage(Long id, UpdateProjectStageRequest request);

    UniversityProjectResponse submitProposal(Long projectId, SubmitProposalRequest request);

    TeamMemberDto addTeamMember(Long projectId, TeamMemberDto memberDto);

    void removeTeamMember(Long projectId, Long memberId);

    List<IndustryOfferDto> getIndustryOffers(String aisheCode);

    UniversityProjectResponse submitCsrPitch(Long projectId, CsrPitchRequest request);

    UniversityProjectResponse recordCitizenVerification(Long projectId, CitizenVerificationRequest request);

    AccreditationReportDto getAccreditationSummary(String aisheCode);
}
