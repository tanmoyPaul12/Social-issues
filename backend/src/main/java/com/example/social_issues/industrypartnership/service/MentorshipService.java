package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.industrypartnership.dto.LogMentorshipSessionRequest;
import com.example.social_issues.industrypartnership.dto.MentorshipEngagementDto;
import com.example.social_issues.industrypartnership.dto.OfferMentorshipRequest;
import com.example.social_issues.industrypartnership.model.MentorshipStatus;

import java.util.List;

public interface MentorshipService {

    List<MentorshipEngagementDto> getMentorshipEngagements(Long userId, MentorshipStatus status);

    MentorshipEngagementDto getMentorshipDetail(Long userId, Long mentorshipId);

    MentorshipEngagementDto offerMentorship(Long userId, Long marketplaceProjectId, OfferMentorshipRequest request);

    MentorshipEngagementDto updateMentorshipStatus(Long userId, Long mentorshipId, MentorshipStatus status);

    MentorshipEngagementDto logSession(Long userId, Long mentorshipId, LogMentorshipSessionRequest request);
}
