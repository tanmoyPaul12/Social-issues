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
import com.example.social_issues.problemsubmission.service.FileStorageService;
import jakarta.persistence.criteria.Predicate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
public class ActivePilotsServiceImpl implements ActivePilotsService {

    private static final Logger log = LoggerFactory.getLogger(ActivePilotsServiceImpl.class);

    private final IndustryProfileRepository industryProfileRepository;
    private final CoFundedPilotRepository pilotRepository;
    private final PilotMilestoneRepository milestoneRepository;
    private final PilotDisbursementRepository disbursementRepository;
    private final PilotDiscussionRepository discussionRepository;
    private final PilotDocumentRepository documentRepository;
    private final CsrCommitmentRepository csrCommitmentRepository;
    private final IndustryActivityLogRepository activityLogRepository;
    private final NotificationEventPublisher eventPublisher;
    private final FileStorageService fileStorageService;

    public ActivePilotsServiceImpl(
            IndustryProfileRepository industryProfileRepository,
            CoFundedPilotRepository pilotRepository,
            PilotMilestoneRepository milestoneRepository,
            PilotDisbursementRepository disbursementRepository,
            PilotDiscussionRepository discussionRepository,
            PilotDocumentRepository documentRepository,
            CsrCommitmentRepository csrCommitmentRepository,
            IndustryActivityLogRepository activityLogRepository,
            NotificationEventPublisher eventPublisher,
            FileStorageService fileStorageService) {
        this.industryProfileRepository = industryProfileRepository;
        this.pilotRepository = pilotRepository;
        this.milestoneRepository = milestoneRepository;
        this.disbursementRepository = disbursementRepository;
        this.discussionRepository = discussionRepository;
        this.documentRepository = documentRepository;
        this.csrCommitmentRepository = csrCommitmentRepository;
        this.activityLogRepository = activityLogRepository;
        this.eventPublisher = eventPublisher;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivePilotSummaryDto> getActivePilots(
            Long userId,
            String status,
            String healthStatus,
            String stage,
            String search,
            String sortBy,
            int page,
            int size
    ) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        Sort sort = resolveSort(sortBy);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(size > 0 ? size : 10, 50), sort);

        Specification<CoFundedPilot> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Profile isolation
            predicates.add(cb.equal(root.get("industryProfile").get("id"), profile.getId()));

            // Status filter
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                try {
                    PilotStatus statusEnum = PilotStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), statusEnum));
                } catch (IllegalArgumentException ignored) {}
            }

            // Health status filter
            if (healthStatus != null && !healthStatus.isBlank() && !healthStatus.equalsIgnoreCase("ALL")) {
                try {
                    PilotHealthStatus healthEnum = PilotHealthStatus.valueOf(healthStatus.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("healthStatus"), healthEnum));
                } catch (IllegalArgumentException ignored) {}
            }

            // Stage filter
            if (stage != null && !stage.isBlank() && !stage.equalsIgnoreCase("ALL")) {
                try {
                    PilotStage stageEnum = PilotStage.valueOf(stage.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("stage"), stageEnum));
                } catch (IllegalArgumentException ignored) {}
            }

            // Keyword search
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate universityLike = cb.like(cb.lower(root.get("universityName")), pattern);
                Predicate mentorLike = cb.like(cb.lower(root.get("facultyLeadName")), pattern);
                predicates.add(cb.or(titleLike, universityLike, mentorLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return pilotRepository.findAll(spec, pageable).map(ActivePilotSummaryDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public ActivePilotsOverviewDto getOverviewMetrics(Long userId) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        Long profileId = profile.getId();

        ActivePilotsOverviewDto overview = new ActivePilotsOverviewDto();
        long totalCount = pilotRepository.countByIndustryProfileId(profileId);
        int activeCount = pilotRepository.countActivePilotsByProfileId(profileId);
        int pendingMilestones = pilotRepository.countPendingMilestonesByProfileId(profileId);
        long atRiskCount = pilotRepository.countByIndustryProfileIdAndHealthStatus(profileId, PilotHealthStatus.AT_RISK);
        long completedCount = pilotRepository.countByIndustryProfileIdAndStatus(profileId, PilotStatus.COMPLETED);

        BigDecimal committed = pilotRepository.sumTotalBudgetByProfileId(profileId);
        BigDecimal disbursed = pilotRepository.sumDisbursedBudgetByProfileId(profileId);

        overview.setTotalPilotsCount(totalCount);
        overview.setActivePilotsCount(activeCount);
        overview.setPendingMilestonesCount(pendingMilestones);
        overview.setAtRiskPilotsCount(atRiskCount);
        overview.setCompletedPilotsCount(completedCount);

        overview.setTotalCommittedAmount(committed);
        overview.setTotalCommittedFormatted(formatCurrency(committed));
        overview.setTotalDisbursedAmount(disbursed);
        overview.setTotalDisbursedFormatted(formatCurrency(disbursed));

        if (committed.compareTo(BigDecimal.ZERO) > 0) {
            double pct = disbursed.doubleValue() / committed.doubleValue() * 100.0;
            overview.setOverallDisbursedPercentage(Math.min(100.0, Math.round(pct * 10.0) / 10.0));
        } else {
            overview.setOverallDisbursedPercentage(0.0);
        }

        return overview;
    }

    @Override
    @Transactional(readOnly = true)
    public ActivePilotDetailDto getPilotDetail(Long userId, Long pilotId) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        CoFundedPilot pilot = resolvePilotForProfile(pilotId, profile.getId());

        ActivePilotDetailDto detail = new ActivePilotDetailDto();
        detail.setProject(ActivePilotSummaryDto.fromEntity(pilot));

        // Milestones
        List<PilotMilestone> milestones = milestoneRepository.findByPilotIdOrderByMilestoneNumberAsc(pilotId);
        detail.setMilestones(milestones.stream().map(MilestoneDto::fromEntity).toList());
        detail.setTotalMilestonesCount(milestones.size());
        detail.setCompletedMilestonesCount((int) milestones.stream().filter(m -> m.getStatus() == MilestoneStatus.APPROVED).count());
        detail.setPendingReviewMilestonesCount((int) milestones.stream().filter(m -> m.getStatus() == MilestoneStatus.SUBMITTED_FOR_REVIEW).count());

        // Disbursements
        List<PilotDisbursement> disbursements = disbursementRepository.findByPilotIdOrderByTrancheNumberAsc(pilotId);
        detail.setDisbursements(disbursements.stream().map(DisbursementDto::fromEntity).toList());

        // Discussions
        List<PilotDiscussion> discussions = discussionRepository.findByPilotIdOrderByCreatedAtAsc(pilotId);
        detail.setRecentDiscussions(discussions.stream().map(DiscussionMessageDto::fromEntity).toList());

        // Documents
        List<PilotDocument> documents = documentRepository.findByPilotIdOrderByUploadedAtDesc(pilotId);
        detail.setDocuments(documents.stream().map(PilotDocumentDto::fromEntity).toList());

        // Financial totals
        BigDecimal committed = pilot.getTotalBudget() != null ? pilot.getTotalBudget() : BigDecimal.ZERO;
        BigDecimal disbursed = pilot.getDisbursedBudget() != null ? pilot.getDisbursedBudget() : BigDecimal.ZERO;
        BigDecimal remaining = committed.subtract(disbursed).max(BigDecimal.ZERO);

        detail.setTotalCommittedGrant(committed);
        detail.setTotalCommittedFormatted(formatCurrency(committed));
        detail.setTotalDisbursedGrant(disbursed);
        detail.setTotalDisbursedFormatted(formatCurrency(disbursed));
        detail.setRemainingGrant(remaining);
        detail.setRemainingFormatted(formatCurrency(remaining));

        return detail;
    }

    @Override
    @Transactional
    public ActivePilotSummaryDto updateHealthStatus(Long userId, Long pilotId, UpdatePilotHealthRequest request) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        CoFundedPilot pilot = resolvePilotForProfile(pilotId, profile.getId());

        pilot.setHealthStatus(request.getHealthStatus());
        pilotRepository.save(pilot);

        IndustryActivityLog activity = new IndustryActivityLog();
        activity.setIndustryProfile(profile);
        activity.setEventType("PILOT_HEALTH_UPDATED");
        activity.setTitle("Health Status Updated: " + pilot.getTitle());
        activity.setDescription(String.format("Status adjusted to %s for project at %s.",
                request.getHealthStatus().name(), pilot.getUniversityName()));
        activity.setSeverity(request.getHealthStatus() == PilotHealthStatus.AT_RISK ? ActivitySeverity.WARNING : ActivitySeverity.INFO);
        activity.setReferenceEntityType("PILOT");
        activity.setReferenceEntityId(pilot.getId());
        activityLogRepository.save(activity);

        return ActivePilotSummaryDto.fromEntity(pilot);
    }

    @Override
    @Transactional
    public MilestoneDto reviewMilestone(Long userId, Long pilotId, Long milestoneId, ReviewMilestoneRequest request) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        CoFundedPilot pilot = resolvePilotForProfile(pilotId, profile.getId());

        PilotMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with ID: " + milestoneId));

        if (!milestone.getPilot().getId().equals(pilot.getId())) {
            throw new IllegalArgumentException("Milestone does not belong to the specified pilot project");
        }

        boolean isApproval = "APPROVE".equalsIgnoreCase(request.getAction());

        if (isApproval) {
            milestone.setStatus(MilestoneStatus.APPROVED);
            milestone.setCompletedDate(LocalDate.now());
            milestone.setCompletionPercentage(100);
            milestone.setReviewedAt(LocalDateTime.now());
            milestone.setReviewerUserId(userId);
            if (request.getReviewRemarks() != null && !request.getReviewRemarks().isBlank()) {
                milestone.setReviewRemarks(request.getReviewRemarks().trim());
            }
            milestoneRepository.save(milestone);

            // Recompute pilot progress & milestones
            List<PilotMilestone> allMilestones = milestoneRepository.findByPilotIdOrderByMilestoneNumberAsc(pilotId);
            long approvedCount = allMilestones.stream().filter(m -> m.getStatus() == MilestoneStatus.APPROVED).count();
            int total = allMilestones.size();
            int progress = total > 0 ? (int) Math.round((double) approvedCount / total * 100.0) : 0;
            pilot.setProgressPercentage(progress);

            if (approvedCount >= total && total > 0) {
                pilot.setStatus(PilotStatus.COMPLETED);
                pilot.setHealthStatus(PilotHealthStatus.COMPLETED);
            } else {
                pilot.setStatus(PilotStatus.ACTIVE);
                pilot.setCurrentMilestone(Math.min((int) approvedCount + 1, total));
                // Next due date to next milestone
                allMilestones.stream()
                        .filter(m -> m.getStatus() == MilestoneStatus.UPCOMING || m.getStatus() == MilestoneStatus.IN_PROGRESS || m.getStatus() == MilestoneStatus.SUBMITTED_FOR_REVIEW)
                        .findFirst()
                        .ifPresent(nextM -> pilot.setNextDeliverableDate(nextM.getTargetDate()));
            }
            pilotRepository.save(pilot);

            // Activity Log
            IndustryActivityLog activity = new IndustryActivityLog();
            activity.setIndustryProfile(profile);
            activity.setEventType("MILESTONE_APPROVED");
            activity.setTitle(String.format("Milestone %d Approved: %s", milestone.getMilestoneNumber(), milestone.getTitle()));
            activity.setDescription(String.format("Approved deliverable for %s at %s.", pilot.getTitle(), pilot.getUniversityName()));
            activity.setSeverity(ActivitySeverity.SUCCESS);
            activity.setReferenceEntityType("PILOT");
            activity.setReferenceEntityId(pilot.getId());
            activityLogRepository.save(activity);

            // Real-time Event
            NotificationEvent event = new NotificationEvent();
            event.setEventType("MILESTONE_APPROVED");
            event.setSource("backend.pilots");
            event.setRecipientUserId(userId);
            event.setRecipientUserType("INDUSTRY_PARTNER");
            event.setTitle("Milestone Approved");
            event.setMessage(String.format("Milestone %d for '%s' was verified and approved.", milestone.getMilestoneNumber(), pilot.getTitle()));
            event.setSeverity("SUCCESS");
            event.setActionUrl("/dashboard?role=industry&tab=active-projects");
            eventPublisher.publishIndustryNotification(event);

            // Notify University Channel
            NotificationEvent uniEvent = new NotificationEvent();
            uniEvent.setEventType("MILESTONE_APPROVED");
            uniEvent.setSource("backend.pilots");
            uniEvent.setTitle("Milestone Verified by Industry Partner");
            uniEvent.setMessage(String.format("Milestone %d ('%s') for project '%s' has been approved by the CSR partner.", milestone.getMilestoneNumber(), milestone.getTitle(), pilot.getTitle()));
            uniEvent.setSeverity("SUCCESS");
            uniEvent.setActionUrl("/university/projects");
            uniEvent.setChannels(List.of("IN_APP", "EMAIL"));
            eventPublisher.publishUniversityNotification(uniEvent);

        } else {
            milestone.setStatus(MilestoneStatus.REVISION_REQUESTED);
            milestone.setReviewedAt(LocalDateTime.now());
            milestone.setReviewerUserId(userId);
            if (request.getReviewRemarks() != null && !request.getReviewRemarks().isBlank()) {
                milestone.setReviewRemarks(request.getReviewRemarks().trim());
            }
            milestoneRepository.save(milestone);

            pilot.setHealthStatus(PilotHealthStatus.DELAYED);
            pilot.setStatus(PilotStatus.ACTIVE);
            pilotRepository.save(pilot);

            IndustryActivityLog activity = new IndustryActivityLog();
            activity.setIndustryProfile(profile);
            activity.setEventType("MILESTONE_REVISION_REQUESTED");
            activity.setTitle(String.format("Revision Requested on Milestone %d: %s", milestone.getMilestoneNumber(), milestone.getTitle()));
            activity.setDescription(String.format("Comments provided to %s research team.", pilot.getUniversityName()));
            activity.setSeverity(ActivitySeverity.WARNING);
            activity.setReferenceEntityType("PILOT");
            activity.setReferenceEntityId(pilot.getId());
            activityLogRepository.save(activity);

            // Notify University Channel of Revision Request
            NotificationEvent uniEvent = new NotificationEvent();
            uniEvent.setEventType("MILESTONE_REVISION_REQUESTED");
            uniEvent.setSource("backend.pilots");
            uniEvent.setTitle("Milestone Revision Requested");
            uniEvent.setMessage(String.format("Milestone %d ('%s') for '%s' requires revision: %s",
                    milestone.getMilestoneNumber(), milestone.getTitle(), pilot.getTitle(),
                    milestone.getReviewRemarks() != null ? milestone.getReviewRemarks() : "Please check feedback."));
            uniEvent.setSeverity("WARNING");
            uniEvent.setActionUrl("/university/projects");
            uniEvent.setChannels(List.of("IN_APP", "EMAIL"));
            eventPublisher.publishUniversityNotification(uniEvent);
        }

        return MilestoneDto.fromEntity(milestone);
    }

    @Override
    @Transactional
    public DisbursementDto releaseDisbursement(Long userId, Long pilotId, ReleaseDisbursementRequest request) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        CoFundedPilot pilot = resolvePilotForProfile(pilotId, profile.getId());

        PilotDisbursement disbursement = disbursementRepository.findById(request.getDisbursementId())
                .orElseThrow(() -> new ResourceNotFoundException("Disbursement tranche not found with ID: " + request.getDisbursementId()));

        if (!disbursement.getPilot().getId().equals(pilot.getId())) {
            throw new IllegalArgumentException("Disbursement does not belong to the specified pilot project");
        }

        disbursement.setStatus(DisbursementStatus.DISBURSED);
        disbursement.setDisbursedDate(request.getDisbursedDate() != null ? request.getDisbursedDate() : LocalDate.now());
        if (request.getPaymentMethod() != null) disbursement.setPaymentMethod(request.getPaymentMethod());
        if (request.getUtrNumber() != null) disbursement.setUtrNumber(request.getUtrNumber().trim());
        if (request.getReceiptDocUrl() != null) disbursement.setReceiptDocUrl(request.getReceiptDocUrl());
        if (request.getNotes() != null) disbursement.setNotes(request.getNotes().trim());
        disbursementRepository.save(disbursement);

        // Update pilot disbursed budget
        BigDecimal newDisbursedTotal = disbursementRepository.sumDisbursedAmountByPilotId(pilotId);
        pilot.setDisbursedBudget(newDisbursedTotal);
        pilotRepository.save(pilot);

        // Synchronize with CSR Ledger (CsrCommitment if exists)
        csrCommitmentRepository.findAll().stream()
                .filter(c -> c.getPilot() != null && c.getPilot().getId().equals(pilotId))
                .findFirst()
                .ifPresent(commitment -> {
                    commitment.setTotalDisbursedAmount(newDisbursedTotal);
                    csrCommitmentRepository.save(commitment);
                });

        // Activity log
        IndustryActivityLog activity = new IndustryActivityLog();
        activity.setIndustryProfile(profile);
        activity.setEventType("TRANCHE_DISBURSED");
        activity.setTitle(String.format("Grant Tranche Released: %s", disbursement.getTrancheLabel()));
        activity.setDescription(String.format("Released ₹%s (Ref: %s, UTR: %s) to %s.",
                disbursement.getAmount().toPlainString(),
                disbursement.getDisbursementReference(),
                disbursement.getUtrNumber() != null ? disbursement.getUtrNumber() : "N/A",
                pilot.getUniversityName()));
        activity.setSeverity(ActivitySeverity.SUCCESS);
        activity.setReferenceEntityType("PILOT");
        activity.setReferenceEntityId(pilot.getId());
        activityLogRepository.save(activity);

        // Real-time Event
        NotificationEvent event = new NotificationEvent();
        event.setEventType("TRANCHE_DISBURSED");
        event.setSource("backend.pilots");
        event.setRecipientUserId(userId);
        event.setRecipientUserType("INDUSTRY_PARTNER");
        event.setTitle("Grant Tranche Released");
        event.setMessage(String.format("Tranche ₹%s for '%s' marked as disbursed.", disbursement.getAmount().toPlainString(), pilot.getTitle()));
        event.setSeverity("SUCCESS");
        event.setActionUrl("/dashboard?role=industry&tab=active-projects");
        eventPublisher.publishIndustryNotification(event);

        return DisbursementDto.fromEntity(disbursement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscussionMessageDto> getDiscussions(Long userId, Long pilotId) {
        if (pilotId == null) return List.of();
        List<PilotDiscussion> discussions = discussionRepository.findByPilotIdOrderByCreatedAtAsc(pilotId);
        if (discussions.isEmpty()) {
            CoFundedPilot pilot = pilotRepository.findById(pilotId).orElse(null);
            if (pilot == null) {
                List<CoFundedPilot> all = pilotRepository.findAll();
                if (!all.isEmpty()) {
                    discussions = discussionRepository.findByPilotIdOrderByCreatedAtAsc(all.get(0).getId());
                }
            }
        }
        return discussions.stream()
                .map(DiscussionMessageDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public DiscussionMessageDto postDiscussion(Long userId, Long pilotId, PostDiscussionRequest request) {
        if (pilotId == null) {
            pilotId = 1L;
        }
        CoFundedPilot pilot = pilotRepository.findById(pilotId).orElse(null);
        if (pilot == null) {
            List<CoFundedPilot> all = pilotRepository.findAll();
            if (!all.isEmpty()) {
                pilot = all.get(0);
            } else {
                IndustryProfile profile = industryProfileRepository.findAll().stream().findFirst().orElse(null);
                pilot = new CoFundedPilot();
                pilot.setIndustryProfile(profile);
                pilot.setTitle("Collaboration Channel #" + pilotId);
                pilot.setSector(IssueSector.OTHER);
                pilot.setUniversityName("Academic Research Lab");
                pilot = pilotRepository.save(pilot);
            }
        }

        PilotDiscussion discussion = new PilotDiscussion();
        discussion.setPilot(pilot);
        discussion.setSenderUserId(userId != null ? userId : 1L);
        
        String senderName = request.getSenderName() != null && !request.getSenderName().isBlank()
                ? request.getSenderName()
                : "Project Contributor";
        String senderRole = request.getSenderRole() != null && !request.getSenderRole().isBlank()
                ? request.getSenderRole()
                : "INDUSTRY_SPOC";

        discussion.setSenderName(senderName);
        discussion.setSenderRole(senderRole);
        discussion.setMessage(request.getMessage().trim());
        discussion.setAttachmentUrl(request.getAttachmentUrl());
        discussion.setAttachmentName(request.getAttachmentName());
        discussion.setIsPinned(false);
        discussion = discussionRepository.save(discussion);

        // Real-time Event Broadcast
        try {
            NotificationEvent event = new NotificationEvent();
            event.setEventType("PILOT_MESSAGE_POSTED");
            event.setSource("backend.pilots");
            event.setRecipientUserId(userId != null ? userId : 1L);
            event.setRecipientUserType(senderRole);
            event.setTitle("Message Sent: " + (pilot != null ? pilot.getTitle() : "Project Thread"));
            event.setMessage(senderName + ": " + (request.getMessage().length() > 60 ? request.getMessage().substring(0, 57) + "..." : request.getMessage()));
            event.setSeverity("INFO");
            event.setActionUrl("/dashboard?role=industry&tab=communication");
            eventPublisher.publishIndustryNotification(event);
        } catch (Exception e) {
            log.warn("Failed to broadcast discussion notification: {}", e.getMessage());
        }

        return DiscussionMessageDto.fromEntity(discussion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PilotDocumentDto> getDocuments(Long userId, Long pilotId, PilotDocumentType docType) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        resolvePilotForProfile(pilotId, profile.getId());

        List<PilotDocument> docs;
        if (docType != null) {
            docs = documentRepository.findByPilotIdAndDocTypeOrderByUploadedAtDesc(pilotId, docType);
        } else {
            docs = documentRepository.findByPilotIdOrderByUploadedAtDesc(pilotId);
        }
        return docs.stream().map(PilotDocumentDto::fromEntity).toList();
    }

    @Override
    @Transactional
    public PilotDocumentDto uploadDocument(Long userId, Long pilotId, String title, PilotDocumentType docType, MultipartFile file) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        CoFundedPilot pilot = resolvePilotForProfile(pilotId, profile.getId());

        FileStorageService.StoredFile stored = fileStorageService.storeFile(file, "pilots/" + pilotId + "/documents");

        PilotDocument document = new PilotDocument();
        document.setPilot(pilot);
        document.setTitle(title != null && !title.isBlank() ? title.trim() : stored.originalFileName());
        document.setDocType(docType != null ? docType : PilotDocumentType.OTHER);
        document.setFileUrl(stored.fileUrl());
        document.setStorageKey(stored.storageKey());
        document.setFileSizeBytes(stored.sizeBytes());
        document.setMimeType(stored.mimeType());
        document.setUploadedByName(profile.getSpocName() != null ? profile.getSpocName() : profile.getCompanyName());
        document.setUploadedByRole("INDUSTRY_PARTNER");
        document = documentRepository.save(document);

        IndustryActivityLog activity = new IndustryActivityLog();
        activity.setIndustryProfile(profile);
        activity.setEventType("DOCUMENT_UPLOADED");
        activity.setTitle("Project Artifact Uploaded: " + document.getTitle());
        activity.setDescription(String.format("Uploaded %s document for %s.", document.getDocType().name(), pilot.getTitle()));
        activity.setSeverity(ActivitySeverity.INFO);
        activity.setReferenceEntityType("PILOT");
        activity.setReferenceEntityId(pilot.getId());
        activityLogRepository.save(activity);

        return PilotDocumentDto.fromEntity(document);
    }

    @Override
    @Transactional
    public void deleteDocument(Long userId, Long pilotId, Long documentId) {
        IndustryProfile profile = resolveIndustryProfile(userId);
        resolvePilotForProfile(pilotId, profile.getId());

        PilotDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + documentId));

        if (!doc.getPilot().getId().equals(pilotId)) {
            throw new IllegalArgumentException("Document does not belong to specified pilot project");
        }

        fileStorageService.deleteFile(doc.getStorageKey());
        documentRepository.delete(doc);
    }

    private IndustryProfile resolveIndustryProfile(Long userId) {
        return industryProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Industry profile not found for user ID: " + userId));
    }

    private CoFundedPilot resolvePilotForProfile(Long pilotId, Long profileId) {
        CoFundedPilot pilot = pilotRepository.findById(pilotId)
                .orElseThrow(() -> new ResourceNotFoundException("Co-funded pilot not found with ID: " + pilotId));
        if (!pilot.getIndustryProfile().getId().equals(profileId)) {
            throw new IllegalArgumentException("Unauthorized access: Pilot does not belong to your industry profile");
        }
        return pilot;
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sortBy.trim().toUpperCase()) {
            case "NEXT_DUE", "DUE_SOON" -> Sort.by(Sort.Direction.ASC, "nextDeliverableDate");
            case "PROGRESS_HIGH" -> Sort.by(Sort.Direction.DESC, "progressPercentage");
            case "PROGRESS_LOW" -> Sort.by(Sort.Direction.ASC, "progressPercentage");
            case "BUDGET_HIGH" -> Sort.by(Sort.Direction.DESC, "totalBudget");
            case "BUDGET_LOW" -> Sort.by(Sort.Direction.ASC, "totalBudget");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private static String formatCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return "₹0";
        double val = amount.doubleValue();
        if (val >= 10000000) {
            return String.format("₹%.2f Cr", val / 10000000);
        } else if (val >= 100000) {
            return String.format("₹%.1f Lakhs", val / 100000);
        } else if (val >= 1000) {
            return String.format("₹%.1f K", val / 1000);
        }
        return "₹" + amount.toPlainString();
    }
}
