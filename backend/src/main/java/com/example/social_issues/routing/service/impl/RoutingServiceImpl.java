package com.example.social_issues.routing.service.impl;

import com.example.social_issues.auth.model.User;
import com.example.social_issues.auth.repository.UserRepository;
import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import com.example.social_issues.problemsubmission.dto.IssuePageResponse;
import com.example.social_issues.problemsubmission.dto.IssueResponse;
import com.example.social_issues.problemsubmission.dto.IssueSummaryResponse;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.problemsubmission.repository.GrassrootIssueRepository;
import com.example.social_issues.projectlifecycle.service.ProjectMilestoneService;
import com.example.social_issues.routing.dto.TriageAssignRequest;
import com.example.social_issues.routing.dto.TriageRejectRequest;
import com.example.social_issues.routing.dto.TriageValidateRequest;
import com.example.social_issues.routing.service.RoutingService;
import com.example.social_issues.universitycollab.model.UniversityProject;
import com.example.social_issues.universitycollab.model.UniversityProjectStage;
import com.example.social_issues.universitycollab.repository.UniversityProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class RoutingServiceImpl implements RoutingService {

    private static final Logger log = LoggerFactory.getLogger(RoutingServiceImpl.class);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final GrassrootIssueRepository issueRepository;
    private final UserRepository userRepository;
    private final NotificationEventPublisher notificationPublisher;
    private final UniversityProjectRepository universityProjectRepository;
    private final ProjectMilestoneService milestoneService;

    public RoutingServiceImpl(
            GrassrootIssueRepository issueRepository,
            UserRepository userRepository,
            NotificationEventPublisher notificationPublisher,
            UniversityProjectRepository universityProjectRepository,
            ProjectMilestoneService milestoneService
    ) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.notificationPublisher = notificationPublisher;
        this.universityProjectRepository = universityProjectRepository;
        this.milestoneService = milestoneService;
    }

    @Override
    public IssueResponse validateAndConfirm(Long reviewerId, Long issueId, TriageValidateRequest request) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        User reviewer = userRepository.findById(reviewerId).orElse(null);
        String reviewerName = reviewer != null ? reviewer.getName() : "Nodal Admin #" + reviewerId;

        issue.setStatus(IssueStatus.TRIAGED);
        issue.setValidationStatus("PASS");

        String note = request != null && request.getNotes() != null && !request.getNotes().isBlank()
                ? request.getNotes().trim()
                : "Civic grievance verified by State Nodal Triage officer.";

        String auditStamp = String.format("[%s] Validated by %s: %s",
                LocalDateTime.now().format(TIME_FORMATTER), reviewerName, note);

        if (issue.getReviewNotes() == null || issue.getReviewNotes().isBlank()) {
            issue.setReviewNotes(auditStamp);
        } else {
            issue.setReviewNotes(issue.getReviewNotes() + "\n" + auditStamp);
        }

        GrassrootIssue saved = issueRepository.save(issue);
        log.info("Issue #{} validated by Nodal reviewer {} (ID: {})", saved.getIssueNumber(), reviewerName, reviewerId);

        // Notify submitter of validation
        if (saved.getSubmitter() != null) {
            NotificationEvent event = new NotificationEvent();
            event.setEventType("ISSUE_VALIDATED");
            event.setSource("NODAL_TRIAGE");
            event.setRecipientUserId(saved.getSubmitter().getId());
            event.setRecipientUserType("CITIZEN");
            event.setRecipientEmail(saved.getSubmitter().getEmail());
            event.setRecipientPhone(saved.getSubmitter().getPhone());
            event.setTitle("Grievance #" + saved.getIssueNumber() + " Verified");
            event.setMessage("Your grievance '" + saved.getTitle() + "' has been verified by the State Nodal Team and is queued for university R&D assignment.");
            event.setSeverity("SUCCESS");
            event.setActionUrl("/citizen/dashboard");
            event.setReferenceEntityType("ISSUE");
            event.setReferenceEntityId(saved.getId());
            event.setStatDeltas(Map.of("status", "TRIAGED"));
            notificationPublisher.publishCitizenNotification(event);
        }

        return IssueResponse.fromEntity(saved);
    }

    @Override
    public IssueResponse assignToHEI(Long reviewerId, Long issueId, TriageAssignRequest request) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        if (request == null || request.getHeiName() == null || request.getHeiName().isBlank()) {
            throw new IllegalArgumentException("Target HEI / University name is required for assignment.");
        }

        User reviewer = userRepository.findById(reviewerId).orElse(null);
        String reviewerName = reviewer != null ? reviewer.getName() : "Nodal Admin #" + reviewerId;

        String heiName = request.getHeiName().trim();
        issue.setStatus(IssueStatus.ASSIGNED_HEI);
        issue.setValidationStatus("PASS");
        issue.setAssignedHEI(heiName);

        String note = request.getNotes() != null && !request.getNotes().isBlank()
                ? request.getNotes().trim()
                : "Dispatched to university R&D innovation center for challenge solving.";

        String auditStamp = String.format("[%s] Verified & Allocated to HEI '%s' by %s: %s",
                LocalDateTime.now().format(TIME_FORMATTER), heiName, reviewerName, note);

        if (issue.getReviewNotes() == null || issue.getReviewNotes().isBlank()) {
            issue.setReviewNotes(auditStamp);
        } else {
            issue.setReviewNotes(issue.getReviewNotes() + "\n" + auditStamp);
        }

        GrassrootIssue saved = issueRepository.save(issue);
        log.info("Issue #{} assigned to HEI '{}' by reviewer {} (ID: {})", saved.getIssueNumber(), heiName, reviewerName, reviewerId);

        // ── AUTO-PROVISION / UPDATE UNIVERSITY PROJECT IN DATABASE ──
        String aisheCode = resolveAisheCode(heiName, request.getAisheCode());
        UniversityProject project = universityProjectRepository.findByIssueId(saved.getId()).orElse(null);
        boolean isNew = false;
        if (project == null) {
            project = new UniversityProject();
            String safeAishe = aisheCode.replaceAll("[^a-zA-Z0-9]", "");
            String uniqueSuffix = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
            project.setProjectCode("PROJ-" + safeAishe + "-" + uniqueSuffix);
            project.setIssue(saved);
            project.setTicketId(saved.getIssueNumber());
            project.setCreatedAt(LocalDateTime.now());
            isNew = true;
        }

        project.setAisheCode(aisheCode);
        project.setUniversityName(heiName);
        project.setTitle(saved.getTitle());
        project.setAbstractDescription(saved.getDescription());
        project.setDomain(saved.getSector() != null ? saved.getSector().name() : "Engineering & Social Innovation");
        project.setDistrict(saved.getDistrict() != null ? saved.getDistrict() : "Jharkhand");
        project.setStage(UniversityProjectStage.TEAM_FORMATION);
        project.setProgressPercentage(15);
        if (request.getAllocatedGrant() != null) {
            project.setAllocatedGrant(request.getAllocatedGrant());
        } else if (project.getAllocatedGrant() == null) {
            project.setAllocatedGrant(BigDecimal.valueOf(200000));
        }
        project.setCsrPartner(project.getCsrPartner() != null ? project.getCsrPartner() : "State Innovation Fund");
        project.setCurrentMilestone("Project verified and allocated by State Nodal Department. Capstone faculty mentor & student team assembly in progress.");
        project.setCitizenVerificationStatus("AWAITING_DEPLOYMENT");
        project.setUpdatedAt(LocalDateTime.now());

        UniversityProject savedProject = universityProjectRepository.save(project);
        if (isNew) {
            try {
                milestoneService.setupDefaultMilestones(savedProject.getId());
            } catch (Exception e) {
                log.warn("Notice setting default milestones for project #{}: {}", savedProject.getId(), e.getMessage());
            }
        }
        log.info("Auto-provisioned UniversityProject #{} (Code: {}) for verified Issue #{}",
                savedProject.getId(), savedProject.getProjectCode(), saved.getIssueNumber());

        // Notify submitter of HEI assignment
        if (saved.getSubmitter() != null) {
            NotificationEvent event = new NotificationEvent();
            event.setEventType("ISSUE_ASSIGNED_HEI");
            event.setSource("NODAL_TRIAGE");
            event.setRecipientUserId(saved.getSubmitter().getId());
            event.setRecipientUserType("CITIZEN");
            event.setRecipientEmail(saved.getSubmitter().getEmail());
            event.setRecipientPhone(saved.getSubmitter().getPhone());
            event.setTitle("Grievance Assigned to " + heiName);
            event.setMessage("Your grievance #" + saved.getIssueNumber() + " has been verified and allocated to " + heiName + " for research, pilot development, and implementation.");
            event.setSeverity("INFO");
            event.setActionUrl("/citizen/dashboard");
            event.setReferenceEntityType("ISSUE");
            event.setReferenceEntityId(saved.getId());
            event.setStatDeltas(Map.of("status", "ASSIGNED_HEI", "assignedHEI", heiName));
            notificationPublisher.publishCitizenNotification(event);
        }

        // Direct event to university channel
        NotificationEvent uniEvent = new NotificationEvent();
        uniEvent.setEventType("ISSUE_ROUTED_TO_HEI");
        uniEvent.setSource("NODAL_TRIAGE");
        uniEvent.setTitle("New Challenge Assigned: #" + saved.getIssueNumber());
        uniEvent.setMessage("Problem statement #" + saved.getIssueNumber() + " (" + saved.getSector() + ") has been verified by Government and allocated to " + heiName + " as Project " + savedProject.getProjectCode() + ".");
        uniEvent.setSeverity("ACTION_REQUIRED");
        uniEvent.setActionUrl("/university/challenges");
        uniEvent.setReferenceEntityType("ISSUE");
        uniEvent.setReferenceEntityId(saved.getId());
        uniEvent.setChannels(List.of("IN_APP", "EMAIL"));
        notificationPublisher.publishUniversityNotification(uniEvent);

        // Broadcast general notification for university portals
        NotificationEvent generalEvent = new NotificationEvent();
        generalEvent.setEventType("NEW_CHALLENGE_ROUTED");
        generalEvent.setSource("NODAL_TRIAGE");
        generalEvent.setTitle("New Civic Challenge Routed to " + heiName);
        generalEvent.setMessage("Problem statement #" + saved.getIssueNumber() + " (" + saved.getSector() + ") assigned to " + heiName + ".");
        generalEvent.setSeverity("INFO");
        generalEvent.setReferenceEntityType("ISSUE");
        generalEvent.setReferenceEntityId(saved.getId());
        notificationPublisher.publishGeneralNotification(generalEvent);

        IssueResponse res = IssueResponse.fromEntity(saved);
        res.setProjectId(savedProject.getId());
        res.setProjectCode(savedProject.getProjectCode());
        res.setProjectStage(savedProject.getStage().name());
        return res;
    }

    @Override
    public IssueResponse rejectIssue(Long reviewerId, Long issueId, TriageRejectRequest request) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        User reviewer = userRepository.findById(reviewerId).orElse(null);
        String reviewerName = reviewer != null ? reviewer.getName() : "Nodal Admin #" + reviewerId;

        String reason = request != null && request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim()
                : "Submission does not meet civic verification guidelines or is out of jurisdiction.";

        issue.setStatus(IssueStatus.REJECTED);
        issue.setValidationStatus("REJECT");

        String auditStamp = String.format("[%s] Rejected by %s: %s",
                LocalDateTime.now().format(TIME_FORMATTER), reviewerName, reason);

        if (issue.getReviewNotes() == null || issue.getReviewNotes().isBlank()) {
            issue.setReviewNotes(auditStamp);
        } else {
            issue.setReviewNotes(issue.getReviewNotes() + "\n" + auditStamp);
        }

        GrassrootIssue saved = issueRepository.save(issue);
        log.info("Issue #{} rejected by reviewer {} (ID: {}): {}", saved.getIssueNumber(), reviewerName, reviewerId, reason);

        // Notify submitter of rejection
        if (saved.getSubmitter() != null) {
            NotificationEvent event = new NotificationEvent();
            event.setEventType("ISSUE_REJECTED");
            event.setSource("NODAL_TRIAGE");
            event.setRecipientUserId(saved.getSubmitter().getId());
            event.setRecipientUserType("CITIZEN");
            event.setRecipientEmail(saved.getSubmitter().getEmail());
            event.setRecipientPhone(saved.getSubmitter().getPhone());
            event.setTitle("Grievance #" + saved.getIssueNumber() + " Status Update");
            event.setMessage("Your grievance #" + saved.getIssueNumber() + " could not be approved for university routing. Reason: " + reason);
            event.setSeverity("WARNING");
            event.setActionUrl("/citizen/dashboard");
            event.setReferenceEntityType("ISSUE");
            event.setReferenceEntityId(saved.getId());
            event.setStatDeltas(Map.of("status", "REJECTED"));
            notificationPublisher.publishCitizenNotification(event);
        }

        return IssueResponse.fromEntity(saved);
    }

    @Override
    public IssueResponse revokeAllocation(Long reviewerId, Long issueId, com.example.social_issues.routing.dto.TriageRevokeRequest request) {
        GrassrootIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        User reviewer = userRepository.findById(reviewerId).orElse(null);
        String reviewerName = reviewer != null ? reviewer.getName() : "Nodal Admin #" + reviewerId;

        String previousHEI = issue.getAssignedHEI() != null ? issue.getAssignedHEI() : "Assigned Institution";
        String reason = request != null && request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim()
                : "Administrative revocation by State Nodal Department for reallocation/re-triage.";

        issue.setStatus(IssueStatus.TRIAGED);
        issue.setAssignedHEI(null);

        String auditStamp = String.format("[%s] Allocation Revoked from '%s' by %s: %s",
                LocalDateTime.now().format(TIME_FORMATTER), previousHEI, reviewerName, reason);

        if (issue.getReviewNotes() == null || issue.getReviewNotes().isBlank()) {
            issue.setReviewNotes(auditStamp);
        } else {
            issue.setReviewNotes(issue.getReviewNotes() + "\n" + auditStamp);
        }

        GrassrootIssue saved = issueRepository.save(issue);
        log.info("Issue #{} allocation revoked from '{}' by reviewer {} (ID: {}): {}", saved.getIssueNumber(), previousHEI, reviewerName, reviewerId, reason);

        // Delete unfulfilled project record if present so it does not clutter active project oversight
        universityProjectRepository.findByIssueId(saved.getId()).ifPresent(p -> {
            try {
                universityProjectRepository.delete(p);
                log.info("Removed UniversityProject #{} for revoked Issue #{}", p.getId(), saved.getIssueNumber());
            } catch (Exception e) {
                log.warn("Could not delete UniversityProject on revocation: {}", e.getMessage());
            }
        });

        // Notify submitter of revocation & return to pool
        if (saved.getSubmitter() != null) {
            NotificationEvent event = new NotificationEvent();
            event.setEventType("ISSUE_ALLOCATION_REVOKED");
            event.setSource("NODAL_TRIAGE");
            event.setRecipientUserId(saved.getSubmitter().getId());
            event.setRecipientUserType("CITIZEN");
            event.setRecipientEmail(saved.getSubmitter().getEmail());
            event.setRecipientPhone(saved.getSubmitter().getPhone());
            event.setTitle("Grievance #" + saved.getIssueNumber() + " Allocation Updated");
            event.setMessage("Your grievance #" + saved.getIssueNumber() + " allocation was recalled from " + previousHEI + " and returned to the State Nodal Triage Pool for reassignment.");
            event.setSeverity("INFO");
            event.setActionUrl("/citizen/dashboard");
            event.setReferenceEntityType("ISSUE");
            event.setReferenceEntityId(saved.getId());
            event.setStatDeltas(Map.of("status", "TRIAGED"));
            notificationPublisher.publishCitizenNotification(event);
        }

        // Notify university channel of revocation
        NotificationEvent uniEvent = new NotificationEvent();
        uniEvent.setEventType("CHALLENGE_REVOKED_FROM_HEI");
        uniEvent.setSource("NODAL_TRIAGE");
        uniEvent.setTitle("Challenge Recall Notice: #" + saved.getIssueNumber());
        uniEvent.setMessage("Problem statement #" + saved.getIssueNumber() + " has been recalled by State Nodal Department. Reason: " + reason);
        uniEvent.setSeverity("WARNING");
        uniEvent.setActionUrl("/university/inbox");
        uniEvent.setReferenceEntityType("ISSUE");
        uniEvent.setReferenceEntityId(saved.getId());
        uniEvent.setChannels(List.of("IN_APP"));
        notificationPublisher.publishUniversityNotification(uniEvent);

        return IssueResponse.fromEntity(saved);
    }

    private String resolveAisheCode(String heiName, String requestedAishe) {
        if (requestedAishe != null && !requestedAishe.isBlank()) {
            return requestedAishe.trim();
        }
        if (heiName == null || heiName.isBlank()) {
            return "U-0205";
        }
        String lower = heiName.toLowerCase();
        if (lower.contains("bit") || lower.contains("mesra")) return "U-0205";
        if (lower.contains("iit") || lower.contains("ism") || lower.contains("dhanbad")) return "U-0207";
        if (lower.contains("nit") || lower.contains("jamshedpur")) return "U-0206";
        if (lower.contains("ranchi university")) return "U-0208";
        if (lower.contains("kolhan")) return "U-0209";
        if (lower.contains("aiims") || lower.contains("deoghar")) return "U-0210";
        if (lower.contains("vinoba bhave") || lower.contains("vbu")) return "U-0211";
        if (lower.contains("sido kanhu") || lower.contains("skmu")) return "U-0212";
        if (lower.contains("iim") || lower.contains("ranchi")) return "U-0213";
        if (lower.contains("iiit")) return "U-0214";
        return "U-" + Math.abs(heiName.hashCode() % 9000 + 1000);
    }

    @Override
    @Transactional(readOnly = true)
    public IssuePageResponse getTriageQueue(IssueStatus status, String district, IssueSector sector, IssuePriority priority, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)));
        String targetDistrict = (district != null && !district.isBlank() && !"All 24 Districts".equalsIgnoreCase(district.trim()))
                ? district.trim()
                : null;

        Page<GrassrootIssue> issuePage = issueRepository.findTriageQueue(status, sector, priority, targetDistrict, pageable);

        List<IssueSummaryResponse> summaries = issuePage.getContent().stream()
                .map(IssueSummaryResponse::fromEntity)
                .toList();

        return new IssuePageResponse(
                summaries,
                issuePage.getNumber(),
                issuePage.getSize(),
                issuePage.getTotalElements(),
                issuePage.getTotalPages(),
                issuePage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponse> getTriageQueueList(IssueStatus status, String district, IssueSector sector, IssuePriority priority) {
        String targetDistrict = (district != null && !district.isBlank() && !"All 24 Districts".equalsIgnoreCase(district.trim()))
                ? district.trim()
                : null;

        List<GrassrootIssue> issues = issueRepository.findTriageQueueList(status, sector, priority, targetDistrict);
        return issues.stream()
                .map(IssueResponse::fromEntity)
                .toList();
    }
}
