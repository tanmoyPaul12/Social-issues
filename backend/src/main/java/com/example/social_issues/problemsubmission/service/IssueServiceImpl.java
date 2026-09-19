package com.example.social_issues.problemsubmission.service;

import com.example.social_issues.auth.model.EntityType;
import com.example.social_issues.auth.model.User;
import com.example.social_issues.auth.repository.UserRepository;
import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.problemsubmission.dto.*;
import com.example.social_issues.problemsubmission.model.*;
import com.example.social_issues.problemsubmission.repository.GrassrootIssueRepository;
import com.example.social_issues.problemsubmission.repository.IssueAttachmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;

@Service
@Transactional
public class IssueServiceImpl implements IssueService {

    private static final Logger log = LoggerFactory.getLogger(IssueServiceImpl.class);
    private static final int MAX_ATTACHMENTS_PER_ISSUE = 5;

    private final GrassrootIssueRepository issueRepository;
    private final IssueAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final AiServiceClient aiServiceClient;
    private final SecureRandom random = new SecureRandom();

    public IssueServiceImpl(
            GrassrootIssueRepository issueRepository,
            IssueAttachmentRepository attachmentRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService,
            AiServiceClient aiServiceClient
    ) {
        this.issueRepository = issueRepository;
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.aiServiceClient = aiServiceClient;
    }

    @Override
    public IssueResponse createIssue(Long submitterId, IssueSubmitRequest request, boolean isDraft) {
        User submitter = userRepository.findById(submitterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + submitterId));

        GrassrootIssue issue = new GrassrootIssue();
        issue.setIssueNumber(generateUniqueIssueNumber());
        issue.setSubmitter(submitter);
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setSector(request.getSector() != null ? request.getSector() : IssueSector.OTHER);
        issue.setPriority(request.getPriority() != null ? request.getPriority() : IssuePriority.MEDIUM);
        issue.setStatus(isDraft ? IssueStatus.DRAFT : IssueStatus.SUBMITTED);

        // Derive entity type from CitizenProfile or user profile
        EntityType entityType = submitter.getEntityType() != null ? submitter.getEntityType() : EntityType.INDIVIDUAL;
        issue.setSubmitterEntityType(entityType);

        issue.setDistrict(request.getDistrict());
        issue.setBlock(request.getBlock());
        issue.setVillageOrWard(request.getVillageOrWard());
        issue.setLatitude(request.getLatitude());
        issue.setLongitude(request.getLongitude());
        issue.setAddressDescription(request.getAddressDescription());
        issue.setAffectedPopulation(request.getAffectedPopulation());
        issue.setContactName(request.getContactName());
        issue.setContactPhone(request.getContactPhone());
        issue.setIsAnonymous(Boolean.TRUE.equals(request.getIsAnonymous()));

        // Calculate initial impact score
        issue.setEstimatedImpactScore(calculateImpactScore(issue));
        issue.setValidationStatus("PASS");

        // Step 1: AI Vector & Spatial Deduplication Check (Runs before persist)
        try {
            Map<String, Object> dupResult = aiServiceClient.checkDuplicates(issue);
            if (dupResult != null) {
                Boolean isDup = (Boolean) dupResult.get("is_duplicate");
                issue.setIsDuplicate(Boolean.TRUE.equals(isDup));
                if (dupResult.get("cluster_id") instanceof String cId) {
                    issue.setDuplicateClusterId(cId);
                }
                if (dupResult.get("potential_duplicates") instanceof List<?> list && !list.isEmpty()) {
                    issue.setPotentialDuplicatesJson(list.toString());
                }
                if (Boolean.TRUE.equals(isDup)) {
                    log.info("AI Deduplication flagged issue #{} as duplicate (Cluster: {})", issue.getIssueNumber(), issue.getDuplicateClusterId());
                }
            }
        } catch (Exception e) {
            log.warn("AI Deduplication pre-check exception for issue #{}: {}", issue.getIssueNumber(), e.getMessage());
        }

        GrassrootIssue saved = issueRepository.save(issue);
        Long savedIssueId = saved.getId();

        // Step 2: Async AI Multimodal Intelligence & HEI Routing (Non-blocking background pipeline)
        if (!isDraft) {
            triggerAsyncAiPipeline(savedIssueId);
        }

        log.info("Created grassroot issue #{}: {} (Status: {}, Duplicate: {}, Validation: PASS)",
                saved.getIssueNumber(), saved.getTitle(), saved.getStatus(), saved.getIsDuplicate());
        return IssueResponse.fromEntity(saved);
    }



    @Override
    public IssueResponse updateIssue(Long submitterId, Long issueId, IssueUpdateRequest request) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        if (!issue.getSubmitter().getId().equals(submitterId)) {
            throw new IllegalArgumentException("You are not authorized to update this issue");
        }

        if (issue.getStatus() != IssueStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT issues can be directly edited. Current status is " + issue.getStatus());
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            issue.setTitle(request.getTitle());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            issue.setDescription(request.getDescription());
        }
        if (request.getSector() != null) {
            issue.setSector(request.getSector());
        }
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }
        if (request.getDistrict() != null) {
            issue.setDistrict(request.getDistrict());
        }
        if (request.getBlock() != null) {
            issue.setBlock(request.getBlock());
        }
        if (request.getVillageOrWard() != null) {
            issue.setVillageOrWard(request.getVillageOrWard());
        }
        if (request.getLatitude() != null) {
            issue.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            issue.setLongitude(request.getLongitude());
        }
        if (request.getAddressDescription() != null) {
            issue.setAddressDescription(request.getAddressDescription());
        }
        if (request.getAffectedPopulation() != null) {
            issue.setAffectedPopulation(request.getAffectedPopulation());
        }
        if (request.getContactName() != null) {
            issue.setContactName(request.getContactName());
        }
        if (request.getContactPhone() != null) {
            issue.setContactPhone(request.getContactPhone());
        }
        if (request.getIsAnonymous() != null) {
            issue.setIsAnonymous(request.getIsAnonymous());
        }

        issue.setEstimatedImpactScore(calculateImpactScore(issue));
        GrassrootIssue updated = issueRepository.save(issue);
        return IssueResponse.fromEntity(updated);
    }

    @Override
    public IssueResponse submitDraftIssue(Long submitterId, Long issueId) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        if (!issue.getSubmitter().getId().equals(submitterId)) {
            throw new IllegalArgumentException("You are not authorized to submit this issue");
        }

        if (issue.getStatus() != IssueStatus.DRAFT) {
            throw new IllegalStateException("Issue is already submitted with status: " + issue.getStatus());
        }

        issue.setStatus(IssueStatus.SUBMITTED);

        // Deduplication check on draft promotion
        try {
            Map<String, Object> dupResult = aiServiceClient.checkDuplicates(issue);
            if (dupResult != null) {
                Boolean isDup = (Boolean) dupResult.get("is_duplicate");
                issue.setIsDuplicate(Boolean.TRUE.equals(isDup));
                if (dupResult.get("cluster_id") instanceof String cId) {
                    issue.setDuplicateClusterId(cId);
                }
                if (dupResult.get("potential_duplicates") instanceof List<?> list && !list.isEmpty()) {
                    issue.setPotentialDuplicatesJson(list.toString());
                }
            }
        } catch (Exception e) {
            log.warn("AI Deduplication check error on draft submission for issue #{}: {}", issue.getIssueNumber(), e.getMessage());
        }

        GrassrootIssue saved = issueRepository.save(issue);
        Long savedIssueId = saved.getId();
        triggerAsyncAiPipeline(savedIssueId);

        log.info("Draft issue #{} transitioned to SUBMITTED (Duplicate: {})", saved.getIssueNumber(), saved.getIsDuplicate());
        return IssueResponse.fromEntity(saved);
    }

    @Override
    public void deleteIssue(Long submitterId, Long issueId) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        if (!issue.getSubmitter().getId().equals(submitterId)) {
            throw new IllegalArgumentException("You are not authorized to delete this issue");
        }

        if (issue.getStatus() != IssueStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT issues can be deleted");
        }

        // Clean up any uploaded attachments
        if (issue.getAttachments() != null) {
            for (IssueAttachment attachment : issue.getAttachments()) {
                fileStorageService.deleteFile(attachment.getStorageKey());
            }
        }

        issueRepository.delete(issue);
        log.info("Deleted DRAFT issue id: {}", issueId);
    }

    @Override
    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long issueId) {
        GrassrootIssue issue = issueRepository.findByIdWithAttachments(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));
        return IssueResponse.fromEntity(issue);
    }

    @Override
    @Transactional(readOnly = true)
    public IssueResponse getIssueByNumber(String issueNumber) {
        GrassrootIssue issue = issueRepository.findByIssueNumber(issueNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with number: " + issueNumber));
        return IssueResponse.fromEntity(issue);
    }

    @Override
    @Transactional(readOnly = true)
    public IssuePageResponse getIssues(
            IssueStatus status,
            IssueSector sector,
            IssuePriority priority,
            String district,
            String block,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy != null ? sortBy : "createdAt").ascending()
                : Sort.by(sortBy != null ? sortBy : "createdAt").descending();

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)), sort);

        Page<GrassrootIssue> issuePage = issueRepository.findWithFilters(
                status,
                sector,
                priority,
                (district != null && !district.isBlank()) ? district.trim() : null,
                (block != null && !block.isBlank()) ? block.trim() : null,
                (search != null && !search.isBlank()) ? search.trim() : null,
                pageable
        );

        List<IssueSummaryResponse> content = issuePage.getContent().stream()
                .map(IssueSummaryResponse::fromEntity)
                .toList();

        return new IssuePageResponse(
                content,
                issuePage.getNumber(),
                issuePage.getSize(),
                issuePage.getTotalElements(),
                issuePage.getTotalPages(),
                issuePage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public IssuePageResponse getMyIssues(Long submitterId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)));
        Page<GrassrootIssue> issuePage = issueRepository.findBySubmitterIdOrderByCreatedAtDesc(submitterId, pageable);

        List<IssueSummaryResponse> content = issuePage.getContent().stream()
                .map(IssueSummaryResponse::fromEntity)
                .toList();

        return new IssuePageResponse(
                content,
                issuePage.getNumber(),
                issuePage.getSize(),
                issuePage.getTotalElements(),
                issuePage.getTotalPages(),
                issuePage.isLast()
        );
    }

    @Override
    public AttachmentResponse addAttachment(Long submitterId, Long issueId, MultipartFile file) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        if (!issue.getSubmitter().getId().equals(submitterId)) {
            throw new IllegalArgumentException("You are not authorized to upload attachments to this issue");
        }

        long currentCount = attachmentRepository.countByIssueId(issueId);
        if (currentCount >= MAX_ATTACHMENTS_PER_ISSUE) {
            throw new IllegalStateException("Maximum limit of " + MAX_ATTACHMENTS_PER_ISSUE + " attachments reached for this issue");
        }

        FileStorageService.StoredFile stored = fileStorageService.storeFile(file, "issues/" + issue.getIssueNumber());

        IssueAttachment attachment = new IssueAttachment();
        attachment.setIssue(issue);
        attachment.setFileUrl(stored.fileUrl());
        attachment.setStorageKey(stored.storageKey());
        attachment.setFileName(stored.originalFileName());
        attachment.setMimeType(stored.mimeType());
        attachment.setFileSizeBytes(stored.sizeBytes());
        attachment.setFileType(stored.attachmentType());

        IssueAttachment saved = attachmentRepository.save(attachment);
        log.info("Attached evidence file '{}' to issue #{}", saved.getFileName(), issue.getIssueNumber());
        return AttachmentResponse.fromEntity(saved);
    }

    @Override
    public void deleteAttachment(Long submitterId, Long issueId, Long attachmentId) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        if (!issue.getSubmitter().getId().equals(submitterId)) {
            throw new IllegalArgumentException("You are not authorized to delete attachments on this issue");
        }

        IssueAttachment attachment = attachmentRepository.findByIssueIdAndId(issueId, attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));

        fileStorageService.deleteFile(attachment.getStorageKey());
        attachmentRepository.delete(attachment);
        log.info("Deleted attachment id {} from issue #{}", attachmentId, issue.getIssueNumber());
    }

    @Override
    public IssueResponse updateIssueStatus(Long reviewerUserId, Long issueId, IssueStatusUpdateRequest request) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        issue.setStatus(request.getStatus());
        if (request.getReviewNotes() != null) {
            issue.setReviewNotes(request.getReviewNotes());
        }
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }

        if (request.getStatus() == IssueStatus.RESOLVED) {
            issue.setResolvedAt(LocalDateTime.now());
        }

        GrassrootIssue updated = issueRepository.save(issue);
        log.info("Issue #{} status updated to {} by reviewer id {}", updated.getIssueNumber(), updated.getStatus(), reviewerUserId);
        return IssueResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public IssueStatsResponse getIssueStats() {
        IssueStatsResponse stats = new IssueStatsResponse();
        stats.setTotalIssues(issueRepository.count());
        stats.setDraftIssues(issueRepository.countByStatus(IssueStatus.DRAFT));
        stats.setSubmittedIssues(issueRepository.countByStatus(IssueStatus.SUBMITTED));
        stats.setUnderReviewIssues(issueRepository.countByStatus(IssueStatus.UNDER_REVIEW));
        stats.setTriagedIssues(issueRepository.countByStatus(IssueStatus.TRIAGED));
        stats.setAssignedHeiIssues(issueRepository.countByStatus(IssueStatus.ASSIGNED_HEI));
        stats.setInProgressIssues(issueRepository.countByStatus(IssueStatus.IN_PROGRESS));
        stats.setEscalatedIssues(issueRepository.countByStatus(IssueStatus.ESCALATED));
        stats.setResolvedIssues(issueRepository.countByStatus(IssueStatus.RESOLVED));
        stats.setRejectedIssues(issueRepository.countByStatus(IssueStatus.REJECTED));

        Map<String, Long> sectorMap = new LinkedHashMap<>();
        for (Object[] row : issueRepository.countGroupBySector()) {
            if (row[0] != null) {
                sectorMap.put(row[0].toString(), (Long) row[1]);
            }
        }
        stats.setSectorBreakdown(sectorMap);

        Map<String, Long> districtMap = new LinkedHashMap<>();
        for (Object[] row : issueRepository.countGroupByDistrict()) {
            if (row[0] != null) {
                districtMap.put(row[0].toString(), (Long) row[1]);
            }
        }
        stats.setDistrictBreakdown(districtMap);

        return stats;
    }

    private String generateUniqueIssueNumber() {
        int year = Year.now().getValue();
        int randomDigits = 100000 + random.nextInt(900000);
        return String.format("GRI-%d-%06d", year, randomDigits);
    }

    private int calculateImpactScore(GrassrootIssue issue) {
        int score = 10;
        if (issue.getAffectedPopulation() != null) {
            if (issue.getAffectedPopulation() > 10000) score += 50;
            else if (issue.getAffectedPopulation() > 1000) score += 35;
            else if (issue.getAffectedPopulation() > 100) score += 20;
            else score += 10;
        }
        if (issue.getPriority() == IssuePriority.CRITICAL) score += 30;
        else if (issue.getPriority() == IssuePriority.HIGH) score += 20;
        else if (issue.getPriority() == IssuePriority.MEDIUM) score += 10;

        if (issue.getLatitude() != null && issue.getLongitude() != null) score += 10;
        return score;
    }

    private void triggerAsyncAiPipeline(Long savedIssueId) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                GrassrootIssue issueToAudit = issueRepository.findById(savedIssueId).orElse(null);
                if (issueToAudit != null) {
                    Map<String, Object> aiResult = aiServiceClient.processMultimodalIntelligence(issueToAudit, null, null);
                    if (aiResult != null && aiResult.get("generalized_consensus") instanceof Map<?, ?> consensus) {
                        Object levelObj = consensus.get("final_priority_level");
                        String level = levelObj instanceof String str ? str : "MEDIUM";
                        if ("CRITICAL".equalsIgnoreCase(level)) {
                            issueToAudit.setPriority(IssuePriority.CRITICAL);
                        } else if ("HIGH".equalsIgnoreCase(level)) {
                            issueToAudit.setPriority(IssuePriority.HIGH);
                        } else if ("LOW".equalsIgnoreCase(level)) {
                            issueToAudit.setPriority(IssuePriority.LOW);
                        }
                        issueToAudit.setValidationReportJson(aiResult.toString());
                    }

                    // Route challenge to matching university HEIs via AI engine
                    Map<String, Object> routeResult = aiServiceClient.routeChallengeToHEIs(issueToAudit);
                    if (routeResult != null && routeResult.get("recommended_heis") instanceof List<?> recsList && !recsList.isEmpty()) {
                        Object firstItem = recsList.get(0);
                        if (firstItem instanceof Map<?, ?> topMatch && topMatch.get("hei_name") instanceof String topHeiName) {
                            issueToAudit.setAssignedHEI(topHeiName);
                            log.info("AI Matched issue #{} with top university: {}", issueToAudit.getIssueNumber(), topHeiName);
                        }
                        issueToAudit.setRecommendedHeisJson(recsList.toString());
                    }

                    issueRepository.save(issueToAudit);
                    log.info("Async AI Intelligence & HEI Routing finished for issue #{}: Priority={}, AssignedHEI={}",
                            issueToAudit.getIssueNumber(), issueToAudit.getPriority(), issueToAudit.getAssignedHEI());
                }
            } catch (Exception e) {
                log.warn("Async AI processing exception for issue id {}: {}", savedIssueId, e.getMessage());
            }
        });
    }
}
