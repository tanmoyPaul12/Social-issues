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
import com.example.social_issues.routing.dto.TriageAssignRequest;
import com.example.social_issues.routing.dto.TriageRejectRequest;
import com.example.social_issues.routing.dto.TriageValidateRequest;
import com.example.social_issues.routing.service.RoutingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class RoutingServiceImpl implements RoutingService {

    private static final Logger log = LoggerFactory.getLogger(RoutingServiceImpl.class);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final GrassrootIssueRepository issueRepository;
    private final UserRepository userRepository;
    private final NotificationEventPublisher notificationPublisher;

    public RoutingServiceImpl(
            GrassrootIssueRepository issueRepository,
            UserRepository userRepository,
            NotificationEventPublisher notificationPublisher
    ) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.notificationPublisher = notificationPublisher;
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
        issue.setAssignedHEI(heiName);

        String note = request.getNotes() != null && !request.getNotes().isBlank()
                ? request.getNotes().trim()
                : "Dispatched to university R&D innovation center for challenge solving.";

        String auditStamp = String.format("[%s] Assigned to HEI '%s' by %s: %s",
                LocalDateTime.now().format(TIME_FORMATTER), heiName, reviewerName, note);

        if (issue.getReviewNotes() == null || issue.getReviewNotes().isBlank()) {
            issue.setReviewNotes(auditStamp);
        } else {
            issue.setReviewNotes(issue.getReviewNotes() + "\n" + auditStamp);
        }

        GrassrootIssue saved = issueRepository.save(issue);
        log.info("Issue #{} assigned to HEI '{}' by reviewer {} (ID: {})", saved.getIssueNumber(), heiName, reviewerName, reviewerId);

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
            event.setMessage("Your grievance #" + saved.getIssueNumber() + " has been assigned to " + heiName + " for research, pilot development, and implementation.");
            event.setSeverity("INFO");
            event.setActionUrl("/citizen/dashboard");
            event.setReferenceEntityType("ISSUE");
            event.setReferenceEntityId(saved.getId());
            event.setStatDeltas(Map.of("status", "ASSIGNED_HEI", "assignedHEI", heiName));
            notificationPublisher.publishCitizenNotification(event);
        }

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

        return IssueResponse.fromEntity(saved);
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
