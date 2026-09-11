package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.industrypartnership.dto.LogMentorshipSessionRequest;
import com.example.social_issues.industrypartnership.dto.MentorshipEngagementDto;
import com.example.social_issues.industrypartnership.dto.OfferMentorshipRequest;
import com.example.social_issues.industrypartnership.model.MarketplaceProject;
import com.example.social_issues.industrypartnership.model.MentorshipEngagement;
import com.example.social_issues.industrypartnership.model.MentorshipStatus;
import com.example.social_issues.industrypartnership.repository.MarketplaceProjectRepository;
import com.example.social_issues.industrypartnership.repository.MentorshipEngagementRepository;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MentorshipServiceImpl implements MentorshipService {

    private static final Logger log = LoggerFactory.getLogger(MentorshipServiceImpl.class);

    private final MentorshipEngagementRepository mentorshipRepository;
    private final IndustryProfileRepository industryProfileRepository;
    private final MarketplaceProjectRepository projectRepository;
    private final NotificationEventPublisher eventPublisher;

    public MentorshipServiceImpl(
            MentorshipEngagementRepository mentorshipRepository,
            IndustryProfileRepository industryProfileRepository,
            MarketplaceProjectRepository projectRepository,
            NotificationEventPublisher eventPublisher
    ) {
        this.mentorshipRepository = mentorshipRepository;
        this.industryProfileRepository = industryProfileRepository;
        this.projectRepository = projectRepository;
        this.eventPublisher = eventPublisher;
    }

    private IndustryProfile resolveProfile(Long userId) {
        if (userId != null) {
            Optional<IndustryProfile> opt = industryProfileRepository.findByUserId(userId);
            if (opt.isPresent()) return opt.get();
        }
        return industryProfileRepository.findAll().stream().findFirst().orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorshipEngagementDto> getMentorshipEngagements(Long userId, MentorshipStatus status) {
        IndustryProfile profile = resolveProfile(userId);
        if (profile == null) {
            return Collections.emptyList();
        }

        List<MentorshipEngagement> list = (status != null)
                ? mentorshipRepository.findByIndustryProfileIdAndStatus(profile.getId(), status)
                : mentorshipRepository.findByIndustryProfileId(profile.getId());

        return list.stream()
                .map(MentorshipEngagementDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MentorshipEngagementDto getMentorshipDetail(Long userId, Long mentorshipId) {
        IndustryProfile profile = resolveProfile(userId);
        MentorshipEngagement engagement = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new IllegalArgumentException("Mentorship engagement not found with ID: " + mentorshipId));

        if (profile != null && !engagement.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to mentorship engagement");
        }

        return MentorshipEngagementDto.fromEntity(engagement);
    }

    @Override
    @Transactional
    public MentorshipEngagementDto offerMentorship(Long userId, Long marketplaceProjectId, OfferMentorshipRequest request) {
        IndustryProfile profile = resolveProfile(userId);
        if (profile == null) {
            throw new IllegalStateException("Industry profile not found for user: " + userId);
        }

        MarketplaceProject project = projectRepository.findById(marketplaceProjectId)
                .orElseThrow(() -> new IllegalArgumentException("Marketplace project not found with ID: " + marketplaceProjectId));

        Optional<MentorshipEngagement> existing = mentorshipRepository
                .findByMarketplaceProjectIdAndIndustryProfileId(marketplaceProjectId, profile.getId());

        MentorshipEngagement engagement;
        if (existing.isPresent()) {
            engagement = existing.get();
            engagement.setMentorName(request.getMentorName());
            engagement.setMentorDesignation(request.getMentorDesignation());
            engagement.setMentorEmail(request.getMentorEmail());
            engagement.setExpertiseDomains(request.getDomainExpertise());
            engagement.setNotes(request.getMessageNotes());
            engagement.setStatus(MentorshipStatus.PENDING_ACCEPTANCE);
        } else {
            engagement = new MentorshipEngagement();
            engagement.setIndustryProfile(profile);
            engagement.setMarketplaceProject(project);
            engagement.setMentorName(request.getMentorName());
            engagement.setMentorDesignation(request.getMentorDesignation());
            engagement.setMentorEmail(request.getMentorEmail());
            engagement.setExpertiseDomains(request.getDomainExpertise());
            engagement.setNotes(request.getMessageNotes());
            engagement.setStatus(MentorshipStatus.PENDING_ACCEPTANCE);
            engagement.setSessionCount(0);
        }

        engagement = mentorshipRepository.save(engagement);

        // Publish notification event
        try {
            NotificationEvent event = new NotificationEvent();
            event.setEventType("MENTORSHIP_OFFERED");
            event.setTitle("Industry Mentorship Offered");
            event.setMessage((profile != null ? profile.getCompanyName() : "Industry Partner") + " nominated " + request.getMentorName() + " as industry mentor for '" + project.getTitle() + "'");
            event.setRecipientUserType("UNIVERSITY");
            event.setReferenceEntityType("MENTORSHIP");
            event.setReferenceEntityId(engagement.getId());
            eventPublisher.publishIndustryNotification(event);
        } catch (Exception ex) {
            log.warn("Failed to publish mentorship offered notification: {}", ex.getMessage());
        }

        return MentorshipEngagementDto.fromEntity(engagement);
    }

    @Override
    @Transactional
    public MentorshipEngagementDto updateMentorshipStatus(Long userId, Long mentorshipId, MentorshipStatus status) {
        IndustryProfile profile = resolveProfile(userId);
        MentorshipEngagement engagement = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new IllegalArgumentException("Mentorship engagement not found with ID: " + mentorshipId));

        if (profile != null && !engagement.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to mentorship engagement");
        }

        engagement.setStatus(status);
        engagement = mentorshipRepository.save(engagement);

        return MentorshipEngagementDto.fromEntity(engagement);
    }

    @Override
    @Transactional
    public MentorshipEngagementDto logSession(Long userId, Long mentorshipId, LogMentorshipSessionRequest request) {
        IndustryProfile profile = resolveProfile(userId);
        MentorshipEngagement engagement = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new IllegalArgumentException("Mentorship engagement not found with ID: " + mentorshipId));

        if (profile != null && !engagement.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to mentorship engagement");
        }

        int currentCount = (engagement.getSessionCount() != null) ? engagement.getSessionCount() : 0;
        engagement.setSessionCount(currentCount + 1);

        if (request.getNextSessionDate() != null) {
            engagement.setNextSessionDate(request.getNextSessionDate());
        }
        if (request.getMeetingLink() != null && !request.getMeetingLink().isBlank()) {
            engagement.setMeetingLink(request.getMeetingLink());
        }
        if (request.getSessionNotes() != null && !request.getSessionNotes().isBlank()) {
            String existingNotes = engagement.getNotes() != null ? engagement.getNotes() : "";
            String timestamp = LocalDateTime.now().toString().substring(0, 16).replace("T", " ");
            engagement.setNotes(existingNotes + "\n[Session #" + (currentCount + 1) + " - " + timestamp + "]: " + request.getSessionNotes());
        }

        if (engagement.getStatus() == MentorshipStatus.PENDING_ACCEPTANCE) {
            engagement.setStatus(MentorshipStatus.ACTIVE);
        }

        engagement = mentorshipRepository.save(engagement);

        return MentorshipEngagementDto.fromEntity(engagement);
    }
}
