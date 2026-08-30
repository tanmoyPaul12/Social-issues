package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.*;
import com.example.social_issues.industrypartnership.repository.*;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import com.example.social_issues.problemsubmission.model.IssueSector;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.*;

@Service
public class MarketplaceServiceImpl implements MarketplaceService {

    

    private final MarketplaceProjectRepository projectRepository;
    private final MarketplaceEngagementRepository engagementRepository;
    private final IndustryProfileRepository industryProfileRepository;
    private final CsrCommitmentRepository csrCommitmentRepository;
    private final CoFundedPilotRepository coFundedPilotRepository;
    private final IndustryActivityLogRepository activityLogRepository;
    private final NotificationEventPublisher eventPublisher;

    public MarketplaceServiceImpl(
            MarketplaceProjectRepository projectRepository,
            MarketplaceEngagementRepository engagementRepository,
            IndustryProfileRepository industryProfileRepository,
            CsrCommitmentRepository csrCommitmentRepository,
            CoFundedPilotRepository coFundedPilotRepository,
            IndustryActivityLogRepository activityLogRepository,
            NotificationEventPublisher eventPublisher) {
        this.projectRepository = projectRepository;
        this.engagementRepository = engagementRepository;
        this.industryProfileRepository = industryProfileRepository;
        this.csrCommitmentRepository = csrCommitmentRepository;
        this.coFundedPilotRepository = coFundedPilotRepository;
        this.activityLogRepository = activityLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MarketplaceProjectDto> searchProjects(
            String domain,
            String stage,
            String university,
            BigDecimal minFunding,
            BigDecimal maxFunding,
            String search,
            String sortBy,
            int page,
            int size
    ) {
        Sort sort = resolveSort(sortBy);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(size > 0 ? size : 12, 50), sort);

        Specification<MarketplaceProject> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only published / active projects
            predicates.add(cb.equal(root.get("status"), MarketplaceStatus.PUBLISHED));

            // Domain filter
            if (domain != null && !domain.isBlank() && !domain.equalsIgnoreCase("ALL")) {
                try {
                    IssueSector sectorEnum = IssueSector.valueOf(domain.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("sector"), sectorEnum));
                } catch (IllegalArgumentException ignored) {}
            }

            // Stage filter
            if (stage != null && !stage.isBlank() && !stage.equalsIgnoreCase("ALL")) {
                try {
                    MarketplaceStage stageEnum = MarketplaceStage.valueOf(stage.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("stage"), stageEnum));
                } catch (IllegalArgumentException ignored) {}
            }

            // University name filter
            if (university != null && !university.isBlank() && !university.equalsIgnoreCase("ALL")) {
                predicates.add(cb.like(cb.lower(root.get("universityName")), "%" + university.trim().toLowerCase() + "%"));
            }

            // Funding range
            if (minFunding != null && minFunding.compareTo(BigDecimal.ZERO) > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fundingAskAmount"), minFunding));
            }
            if (maxFunding != null && maxFunding.compareTo(BigDecimal.ZERO) > 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fundingAskAmount"), maxFunding));
            }

            // Keyword search across title & abstract
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("abstractDescription")), pattern);
                predicates.add(cb.or(titleLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return projectRepository.findAll(spec, pageable).map(MarketplaceProjectDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceProjectDto getProjectById(Long id) {
        MarketplaceProject project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace project not found with ID: " + id));
        return MarketplaceProjectDto.fromEntity(project);
    }

    @Override
    @Transactional
    public MarketplaceProjectDto commitFunding(Long userId, Long projectId, CommitFundingRequest request) {
        IndustryProfile profile = industryProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Industry profile not found for user ID: " + userId));

        MarketplaceProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace project not found with ID: " + projectId));

        BigDecimal grant = request.getGrantAmount() != null ? request.getGrantAmount() : BigDecimal.ZERO;
        if (grant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Grant amount must be greater than zero");
        }

        // 1. Update committed amount on project
        BigDecimal currentCommitted = project.getFundingCommittedAmount() != null ? project.getFundingCommittedAmount() : BigDecimal.ZERO;
        BigDecimal newCommitted = currentCommitted.add(grant);
        project.setFundingCommittedAmount(newCommitted);
        if (project.getFundingAskAmount() != null && newCommitted.compareTo(project.getFundingAskAmount()) >= 0) {
            project.setStatus(MarketplaceStatus.FULLY_FUNDED);
        }
        projectRepository.save(project);

        // 2. Record engagement offer
        MarketplaceEngagement engagement = new MarketplaceEngagement();
        engagement.setProject(project);
        engagement.setIndustryProfile(profile);
        engagement.setEngagementType(EngagementType.COMMIT_CSR_FUNDING);
        engagement.setProposedFundingAmount(grant);
        engagement.setMentorNomineeName(request.getCorporateMentorName());
        engagement.setMentorNomineeDesignation(request.getCorporateMentorDesignation());
        engagement.setMessageNotes(request.getMessageNotes());
        engagement.setCsrScheduleViiHead(request.getCsrScheduleViiHead());
        engagement.setStatus(EngagementStatus.SUBMITTED);
        engagementRepository.save(engagement);

        // 3. Create Draft Co-Funded Pilot in active pilots pipeline
        CoFundedPilot pilot = new CoFundedPilot();
        pilot.setIndustryProfile(profile);
        pilot.setTitle(project.getTitle());
        pilot.setAbstractDescription(project.getAbstractDescription());
        pilot.setSector(project.getSector());
        pilot.setUniversityId(project.getUniversityId());
        pilot.setUniversityName(project.getUniversityName());
        pilot.setStage(PilotStage.PROPOSAL);
        pilot.setStatus(PilotStatus.ACTIVE);
        pilot.setCurrentMilestone(1);
        pilot.setTotalMilestones(4);
        pilot.setNextDeliverableDate(LocalDate.now().plusMonths(1));
        pilot = coFundedPilotRepository.save(pilot);

        // 4. Register CSR Commitment record (adds to corporate ledger)
        CsrCommitment commitment = new CsrCommitment();
        commitment.setIndustryProfile(profile);
        commitment.setPilot(pilot);
        commitment.setFinancialYear(request.getFinancialYear() != null ? request.getFinancialYear() : "2026-2027");
        commitment.setTotalCommittedAmount(grant);
        commitment.setTotalDisbursedAmount(BigDecimal.ZERO);
        commitment.setScheduleVIICategory(request.getCsrCategory() != null ? request.getCsrCategory() : CsrCategory.EDUCATION_SKILLING);
        commitment.setStatus(CommitmentStatus.COMMITTED);
        commitment.setCsrProjectCode("CSR-MKP-" + project.getId());
        csrCommitmentRepository.save(commitment);

        // 5. Activity log
        IndustryActivityLog activity = new IndustryActivityLog();
        activity.setIndustryProfile(profile);
        activity.setEventType("GRANT_COMMITTED");
        activity.setTitle("CSR Co-Funding Signed: " + project.getTitle());
        activity.setDescription(String.format("Committed ₹%s to %s for %s project.",
                grant.toPlainString(), project.getUniversityName(), project.getTitle()));
        activity.setSeverity(ActivitySeverity.SUCCESS);
        activity.setReferenceEntityType("MARKETPLACE");
        activity.setReferenceEntityId(project.getId());
        activityLogRepository.save(activity);

        // 6. Broadcast Real-time Event via Redis
        NotificationEvent event = new NotificationEvent();
        event.setEventType("CSR_GRANT_COMMITTED");
        event.setSource("backend.marketplace");
        event.setRecipientUserId(userId);
        event.setRecipientUserType("INDUSTRY_PARTNER");
        event.setTitle("Grant Commitment Registered");
        event.setMessage("You committed ₹" + grant.toPlainString() + " for " + project.getTitle() + " (" + project.getUniversityName() + ").");
        event.setSeverity("SUCCESS");
        event.setActionUrl("/dashboard?role=industry");
        eventPublisher.publishIndustryNotification(event);

        return MarketplaceProjectDto.fromEntity(project);
    }

    @Override
    @Transactional
    public void offerMentorship(Long userId, Long projectId, OfferMentorshipRequest request) {
        IndustryProfile profile = industryProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Industry profile not found for user ID: " + userId));

        MarketplaceProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace project not found with ID: " + projectId));

        MarketplaceEngagement engagement = new MarketplaceEngagement();
        engagement.setProject(project);
        engagement.setIndustryProfile(profile);
        engagement.setEngagementType(EngagementType.OFFER_MENTORSHIP);
        engagement.setMentorNomineeName(request.getMentorName());
        engagement.setMentorNomineeDesignation(request.getMentorDesignation());
        engagement.setMentorEmail(request.getMentorEmail());
        engagement.setMessageNotes(request.getMessageNotes());
        engagement.setStatus(EngagementStatus.SUBMITTED);
        engagementRepository.save(engagement);

        IndustryActivityLog activity = new IndustryActivityLog();
        activity.setIndustryProfile(profile);
        activity.setEventType("MENTORSHIP_OFFERED");
        activity.setTitle("Mentorship Nominated: " + request.getMentorName());
        activity.setDescription(String.format("Nominated %s (%s) for '%s' at %s.",
                request.getMentorName(), request.getMentorDesignation() != null ? request.getMentorDesignation() : "Industry Mentor",
                project.getTitle(), project.getUniversityName()));
        activity.setSeverity(ActivitySeverity.INFO);
        activity.setReferenceEntityType("MARKETPLACE");
        activity.setReferenceEntityId(project.getId());
        activityLogRepository.save(activity);

        NotificationEvent event = new NotificationEvent();
        event.setEventType("MENTORSHIP_OFFER_DISPATCHED");
        event.setSource("backend.marketplace");
        event.setRecipientUserId(userId);
        event.setRecipientUserType("INDUSTRY_PARTNER");
        event.setTitle("Mentorship Offer Dispatched");
        event.setMessage("Nomination for " + request.getMentorName() + " sent to " + project.getUniversityName() + ".");
        event.setSeverity("INFO");
        event.setActionUrl("/dashboard?role=industry");
        eventPublisher.publishIndustryNotification(event);
    }

    @Override
    @Transactional
    public void expressInterest(Long userId, Long projectId, ExpressInterestRequest request) {
        IndustryProfile profile = industryProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Industry profile not found for user ID: " + userId));

        MarketplaceProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace project not found with ID: " + projectId));

        MarketplaceEngagement engagement = new MarketplaceEngagement();
        engagement.setProject(project);
        engagement.setIndustryProfile(profile);
        engagement.setEngagementType(EngagementType.EXPRESS_INTEREST);
        engagement.setMentorNomineeName(request.getContactPersonName());
        engagement.setMentorEmail(request.getContactEmail());
        engagement.setMessageNotes(request.getMessageNotes());
        engagement.setStatus(EngagementStatus.SUBMITTED);
        engagementRepository.save(engagement);

        IndustryActivityLog activity = new IndustryActivityLog();
        activity.setIndustryProfile(profile);
        activity.setEventType("INTEREST_EXPRESSED");
        activity.setTitle("Letter of Intent Dispatched: " + project.getTitle());
        activity.setDescription(String.format("Dispatched LOI to %s research team.", project.getUniversityName()));
        activity.setSeverity(ActivitySeverity.INFO);
        activity.setReferenceEntityType("MARKETPLACE");
        activity.setReferenceEntityId(project.getId());
        activityLogRepository.save(activity);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceMetaDto getMetadata() {
        long totalPublished = projectRepository.countByStatus(MarketplaceStatus.PUBLISHED);
        List<String> universities = projectRepository.findDistinctUniversityNames();

        Map<String, Long> sectorCounts = new HashMap<>();
        for (Object[] row : projectRepository.countProjectsBySector()) {
            if (row[0] != null) {
                sectorCounts.put(row[0].toString(), (Long) row[1]);
            }
        }

        Map<String, Long> stageCounts = new HashMap<>();
        for (Object[] row : projectRepository.countProjectsByStage()) {
            if (row[0] != null) {
                stageCounts.put(row[0].toString(), (Long) row[1]);
            }
        }

        return new MarketplaceMetaDto(totalPublished, universities, sectorCounts, stageCounts);
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sortBy.trim().toUpperCase()) {
            case "FUNDING_ASK_HIGH" -> Sort.by(Sort.Direction.DESC, "fundingAskAmount");
            case "FUNDING_ASK_LOW" -> Sort.by(Sort.Direction.ASC, "fundingAskAmount");
            case "MOST_COMMITTED", "MOST_FUNDED" -> Sort.by(Sort.Direction.DESC, "fundingCommittedAmount");
            case "CLOSING_SOON" -> Sort.by(Sort.Direction.ASC, "closingDate");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
