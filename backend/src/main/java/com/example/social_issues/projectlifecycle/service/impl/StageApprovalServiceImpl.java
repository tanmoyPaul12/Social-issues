package com.example.social_issues.projectlifecycle.service.impl;

import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.problemsubmission.repository.GrassrootIssueRepository;
import com.example.social_issues.projectlifecycle.dto.ApprovalSignoffDto;
import com.example.social_issues.projectlifecycle.dto.DualClosedLoopStatusDto;
import com.example.social_issues.projectlifecycle.dto.SubmitSignoffRequest;
import com.example.social_issues.projectlifecycle.model.ApprovalStage;
import com.example.social_issues.projectlifecycle.model.ApprovalStatus;
import com.example.social_issues.projectlifecycle.model.ApproverRole;
import com.example.social_issues.projectlifecycle.model.StageApprovalSignoff;
import com.example.social_issues.projectlifecycle.repository.StageApprovalSignoffRepository;
import com.example.social_issues.projectlifecycle.service.StageApprovalService;
import com.example.social_issues.universitycollab.model.UniversityProjectStage;
import com.example.social_issues.universitycollab.repository.UniversityProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StageApprovalServiceImpl implements StageApprovalService {

    private static final Logger log = LoggerFactory.getLogger(StageApprovalServiceImpl.class);

    private final StageApprovalSignoffRepository signoffRepository;
    private final UniversityProjectRepository universityProjectRepository;
    private final GrassrootIssueRepository grassrootIssueRepository;
    private final NotificationEventPublisher notificationEventPublisher;

    public StageApprovalServiceImpl(
            StageApprovalSignoffRepository signoffRepository,
            UniversityProjectRepository universityProjectRepository,
            GrassrootIssueRepository grassrootIssueRepository,
            NotificationEventPublisher notificationEventPublisher
    ) {
        this.signoffRepository = signoffRepository;
        this.universityProjectRepository = universityProjectRepository;
        this.grassrootIssueRepository = grassrootIssueRepository;
        this.notificationEventPublisher = notificationEventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalSignoffDto> getSignoffsByProject(Long projectId) {
        return signoffRepository.findByProjectIdOrderBySignedAtAsc(projectId).stream()
                .map(ApprovalSignoffDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DualClosedLoopStatusDto getDualClosedLoopStatus(Long projectId) {
        DualClosedLoopStatusDto dto = new DualClosedLoopStatusDto();
        dto.setProjectId(projectId);

        Optional<StageApprovalSignoff> citizenSignoff = signoffRepository
                .findByProjectIdAndStageAndApproverRole(projectId, ApprovalStage.FINAL_RESOLUTION, ApproverRole.CITIZEN_REPORTER);

        if (citizenSignoff.isPresent()) {
            StageApprovalSignoff s = citizenSignoff.get();
            dto.setCitizenSignedOff(s.getApprovalStatus() == ApprovalStatus.APPROVED || s.getApprovalStatus() == ApprovalStatus.WAIVED_BY_ADMIN);
            dto.setCitizenRating(s.getCitizenRating());
            dto.setCitizenRemarks(s.getRemarks());
            dto.setCitizenSignedAt(s.getSignedAt());
        }

        Optional<StageApprovalSignoff> nodalSignoff = signoffRepository
                .findByProjectIdAndStageAndApproverRole(projectId, ApprovalStage.FINAL_RESOLUTION, ApproverRole.NODAL_GOVT_OFFICER);

        if (nodalSignoff.isPresent()) {
            StageApprovalSignoff s = nodalSignoff.get();
            dto.setNodalOfficerSignedOff(s.getApprovalStatus() == ApprovalStatus.APPROVED);
            dto.setNodalOfficerName(s.getApproverName());
            dto.setClosureCertificateUrl(s.getClosureCertificateUrl());
            dto.setNodalOfficerSignedAt(s.getSignedAt());
        }

        dto.setFullyClosedAndResolved(dto.isCitizenSignedOff() && dto.isNodalOfficerSignedOff());
        return dto;
    }

    @Override
    @Transactional
    public ApprovalSignoffDto recordSignoff(Long projectId, SubmitSignoffRequest request, Long actorUserId, String fallbackActorName) {
        StageApprovalSignoff signoff = signoffRepository
                .findByProjectIdAndStageAndApproverRole(projectId, request.getStage(), request.getApproverRole())
                .orElse(new StageApprovalSignoff());

        signoff.setProjectId(projectId);
        signoff.setStage(request.getStage());
        signoff.setApproverRole(request.getApproverRole());
        signoff.setApproverUserId(actorUserId);
        signoff.setApproverName(request.getApproverName() != null && !request.getApproverName().isBlank()
                ? request.getApproverName().trim()
                : (fallbackActorName != null ? fallbackActorName : "Authorized Approver"));
        signoff.setApprovalStatus(request.getApprovalStatus());
        signoff.setRemarks(request.getRemarks());
        signoff.setSignedAt(LocalDateTime.now());

        if (request.getCitizenRating() != null) {
            signoff.setCitizenRating(request.getCitizenRating());
        }
        if (request.getClosureCertificateStorageKey() != null) {
            signoff.setClosureCertificateStorageKey(request.getClosureCertificateStorageKey());
        }
        if (request.getClosureCertificateUrl() != null) {
            signoff.setClosureCertificateUrl(request.getClosureCertificateUrl());
        }

        // Generate SHA-256 Digital Signature Hash
        String rawSignatureData = String.format("PROJECT:%d|STAGE:%s|ROLE:%s|USER:%s|TIME:%s",
                projectId, request.getStage(), request.getApproverRole(), actorUserId, signoff.getSignedAt());
        signoff.setDigitalSignatureHash(computeSha256(rawSignatureData));

        StageApprovalSignoff saved = signoffRepository.save(signoff);
        log.info("Recorded digital sign-off [Role: {}, Stage: {}] for project id: {}",
                saved.getApproverRole(), saved.getStage(), projectId);

        // Publish Stage Signoff Notification
        try {
            NotificationEvent event = new NotificationEvent();
            String eventType = "STAGE_APPROVED";
            String severity = "SUCCESS";
            if (saved.getApprovalStatus() == ApprovalStatus.REJECTED) {
                eventType = "STAGE_REJECTED";
                severity = "WARNING";
            } else if (saved.getApprovalStatus() == ApprovalStatus.CHANGES_REQUESTED) {
                eventType = "STAGE_CHANGES_REQUESTED";
                severity = "WARNING";
            }

            event.setEventType(eventType);
            event.setSource("STAGE_APPROVAL_SERVICE");
            event.setTitle(String.format("Stage %s: %s by %s", saved.getStage(), saved.getApprovalStatus(), saved.getApproverName()));
            event.setMessage(String.format("Project #%d stage '%s' recorded sign-off status '%s'. Remarks: %s",
                    projectId, saved.getStage(), saved.getApprovalStatus(),
                    saved.getRemarks() != null ? saved.getRemarks() : "None"));
            event.setSeverity(severity);
            event.setActionUrl("/dashboard?role=industry&tab=active-projects");
            event.setReferenceEntityType("PROJECT_STAGE_SIGNOFF");
            event.setReferenceEntityId(saved.getId());
            event.setChannels(List.of("IN_APP", "EMAIL"));

            // Broadcast to both Industry & University channels
            notificationEventPublisher.publishIndustryNotification(event);
            notificationEventPublisher.publishUniversityNotification(event);
        } catch (Exception e) {
            log.warn("Failed to publish signoff notification: {}", e.getMessage());
        }

        // Check if Closed-Loop Dual Signoff is achieved on FINAL_RESOLUTION
        if (request.getStage() == ApprovalStage.FINAL_RESOLUTION && request.getApprovalStatus() == ApprovalStatus.APPROVED) {
            checkAndApplyFinalResolution(projectId);
        }

        return ApprovalSignoffDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteSignoff(Long id) {
        StageApprovalSignoff signoff = signoffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sign-off record not found with id: " + id));
        signoffRepository.delete(signoff);
        log.info("Deleted sign-off record id: {}", id);
    }

    private void checkAndApplyFinalResolution(Long projectId) {
        DualClosedLoopStatusDto status = getDualClosedLoopStatus(projectId);
        if (status.isFullyClosedAndResolved()) {
            log.info("🎉 Dual Closed-Loop Signoff complete for project id: {}. Transitioning project and issue to COMPLETED/RESOLVED.", projectId);

            // Update UniversityProject
            universityProjectRepository.findById(projectId).ifPresent(project -> {
                project.setStage(UniversityProjectStage.COMPLETED);
                project.setProgressPercentage(100);
                project.setCitizenVerificationStatus("VERIFIED");
                if (status.getCitizenRating() != null) {
                    project.setCitizenRating((double) status.getCitizenRating());
                }
                if (status.getCitizenRemarks() != null) {
                    project.setCitizenFeedback(status.getCitizenRemarks());
                }
                universityProjectRepository.save(project);

                // Update linked GrassrootIssue
                if (project.getIssue() != null) {
                    GrassrootIssue issue = project.getIssue();
                    issue.setStatus(IssueStatus.RESOLVED);
                    issue.setResolvedAt(LocalDateTime.now());
                    grassrootIssueRepository.save(issue);
                    log.info("Issue #{} successfully transitioned to RESOLVED via closed-loop sign-off.", issue.getIssueNumber());

                    // Publish Resolution Event to Citizen
                    try {
                        NotificationEvent citizenEvent = new NotificationEvent();
                        citizenEvent.setEventType("SOLUTION_DEPLOYED_RESOLVED");
                        citizenEvent.setSource("STAGE_APPROVAL_SERVICE");
                        if (issue.getSubmitter() != null) {
                            citizenEvent.setRecipientUserId(issue.getSubmitter().getId());
                            citizenEvent.setRecipientEmail(issue.getSubmitter().getEmail());
                            citizenEvent.setRecipientPhone(issue.getContactPhone() != null ? issue.getContactPhone() : issue.getSubmitter().getPhone());
                        }
                        citizenEvent.setTitle("Solution Deployed & Grievance Resolved!");
                        citizenEvent.setMessage(String.format("Your reported issue #%s ('%s') has been successfully resolved and deployed in the field!",
                                issue.getIssueNumber(), issue.getTitle()));
                        citizenEvent.setSeverity("SUCCESS");
                        citizenEvent.setActionUrl("/challenges/" + issue.getId());
                        citizenEvent.setReferenceEntityType("GRASSROOT_ISSUE");
                        citizenEvent.setReferenceEntityId(issue.getId());
                        citizenEvent.setChannels(List.of("IN_APP", "SMS", "EMAIL"));
                        notificationEventPublisher.publishCitizenNotification(citizenEvent);
                    } catch (Exception ex) {
                        log.warn("Failed to publish resolution event to citizen: {}", ex.getMessage());
                    }
                }
            });
        }
    }

    private String computeSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "SIG-" + Long.toHexString(System.currentTimeMillis());
        }
    }
}
