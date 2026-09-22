package com.example.social_issues.industryproposal.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.model.Role;
import com.example.social_issues.auth.model.User;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.auth.repository.UserRepository;
import com.example.social_issues.industryproposal.dto.*;
import com.example.social_issues.industryproposal.model.*;
import com.example.social_issues.industryproposal.repository.*;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.problemsubmission.repository.GrassrootIssueRepository;
import com.example.social_issues.problemsubmission.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IndustryProposalServiceImpl implements IndustryProposalService {

    private static final Logger log = LoggerFactory.getLogger(IndustryProposalServiceImpl.class);

    private final IssuePublicationRepository issuePublicationRepository;
    private final IndustryProposalRepository industryProposalRepository;
    private final ProposalDocumentRepository proposalDocumentRepository;
    private final ProposalDiscussionRepository proposalDiscussionRepository;
    private final GrassrootIssueRepository grassrootIssueRepository;
    private final UserRepository userRepository;
    private final IndustryProfileRepository industryProfileRepository;
    private final IssuePdfGeneratorService issuePdfGeneratorService;
    private final FileStorageService fileStorageService;
    private final NotificationEventPublisher notificationEventPublisher;

    public IndustryProposalServiceImpl(
            IssuePublicationRepository issuePublicationRepository,
            IndustryProposalRepository industryProposalRepository,
            ProposalDocumentRepository proposalDocumentRepository,
            ProposalDiscussionRepository proposalDiscussionRepository,
            GrassrootIssueRepository grassrootIssueRepository,
            UserRepository userRepository,
            IndustryProfileRepository industryProfileRepository,
            IssuePdfGeneratorService issuePdfGeneratorService,
            FileStorageService fileStorageService,
            NotificationEventPublisher notificationEventPublisher
    ) {
        this.issuePublicationRepository = issuePublicationRepository;
        this.industryProposalRepository = industryProposalRepository;
        this.proposalDocumentRepository = proposalDocumentRepository;
        this.proposalDiscussionRepository = proposalDiscussionRepository;
        this.grassrootIssueRepository = grassrootIssueRepository;
        this.userRepository = userRepository;
        this.industryProfileRepository = industryProfileRepository;
        this.issuePdfGeneratorService = issuePdfGeneratorService;
        this.fileStorageService = fileStorageService;
        this.notificationEventPublisher = notificationEventPublisher;
    }

    @Override
    @Transactional
    public PublicationResponse publishIssueToIndustry(Long issueId, Long userId, PublishIssueRequest request, MultipartFile manualGuidelineDoc) {
        User user = getUserOrThrow(userId);
        validatePublisherRole(user);

        GrassrootIssue issue = grassrootIssueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Grassroot issue not found with ID: " + issueId));

        // Update issue status
        issue.setStatus(IssueStatus.PUBLISHED_TO_INDUSTRY);
        grassrootIssueRepository.save(issue);

        // Upload optional college manual guideline doc
        String guidelineDocUrl = request != null ? request.getGuidelineDocUrl() : null;
        String guidelineDocName = request != null ? request.getGuidelineDocName() : null;

        if (manualGuidelineDoc != null && !manualGuidelineDoc.isEmpty()) {
            FileStorageService.StoredFile storedDoc = fileStorageService.storeFile(manualGuidelineDoc, "proposals/guidelines");
            guidelineDocUrl = storedDoc.fileUrl();
            guidelineDocName = manualGuidelineDoc.getOriginalFilename();
        }

        String notes = request != null ? request.getCollegeCustomNotes() : null;

        // Generate Apache PDFBox brief
        IssuePdfGeneratorService.GeneratedPdfResult pdfResult = issuePdfGeneratorService.generateAndStoreIssueBrief(issue, notes);

        // Create or update publication record
        IssuePublicationRecord publication = issuePublicationRepository.findByIssueId(issueId)
                .orElseGet(() -> {
                    IssuePublicationRecord rec = new IssuePublicationRecord();
                    rec.setIssue(issue);
                    return rec;
                });

        publication.setPublishedByUser(user);
        publication.setPublishedByName(user.getName());
        publication.setPublishedByRole(user.getRole() != null ? user.getRole().name() : "UNIVERSITY");
        publication.setIsPublishedToIndustry(true);
        publication.setPublishedAt(LocalDateTime.now());
        publication.setGeneratedPdfUrl(pdfResult.fileUrl());
        publication.setGeneratedPdfStorageKey(pdfResult.storageKey());
        publication.setPdfGeneratedAt(LocalDateTime.now());
        publication.setCollegeCustomNotes(notes);
        publication.setCollegeGuidelineDocUrl(guidelineDocUrl);
        publication.setCollegeGuidelineDocName(guidelineDocName);

        IssuePublicationRecord savedPub = issuePublicationRepository.save(publication);

        // Broadcast notification to all industry partners via Redis
        NotificationEvent event = new NotificationEvent();
        event.setEventType("ISSUE_PUBLISHED_TO_INDUSTRY");
        event.setSource("INDUSTRY_PROPOSAL_PIPELINE");
        event.setRecipientUserType("INDUSTRY");
        event.setTitle("New Problem Brief Published for Proposals: " + issue.getTitle());
        event.setMessage("College/University has published a new problem brief (#" + issue.getIssueNumber() + "). Download the brief and submit your solution proposal.");
        event.setSeverity("ACTION_REQUIRED");
        event.setActionUrl("/industry/proposals/published-issues");
        event.setReferenceEntityType("ISSUE_PUBLICATION");
        event.setReferenceEntityId(savedPub.getId());
        notificationEventPublisher.publishIndustryNotification(event);

        log.info("Issue #{} successfully published to industry partners by user {}", issue.getIssueNumber(), user.getName());
        return mapToPublicationResponse(savedPub);
    }

    @Override
    @Transactional
    public PublicationResponse togglePublicationStatus(Long publicationId, Long userId, boolean isPublished) {
        User user = getUserOrThrow(userId);
        validatePublisherRole(user);

        IssuePublicationRecord publication = issuePublicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication record not found with ID: " + publicationId));

        publication.setIsPublishedToIndustry(isPublished);
        IssuePublicationRecord saved = issuePublicationRepository.save(publication);

        if (publication.getIssue() != null) {
            GrassrootIssue issue = publication.getIssue();
            issue.setStatus(isPublished ? IssueStatus.PUBLISHED_TO_INDUSTRY : IssueStatus.ASSIGNED_HEI);
            grassrootIssueRepository.save(issue);
        }

        return mapToPublicationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicationResponse getPublicationDetails(Long publicationId) {
        IssuePublicationRecord publication = issuePublicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication record not found with ID: " + publicationId));
        return mapToPublicationResponse(publication);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicationResponse getPublicationByIssueId(Long issueId) {
        IssuePublicationRecord publication = issuePublicationRepository.findByIssueId(issueId)
                .orElseThrow(() -> new IllegalArgumentException("No publication record found for issue ID: " + issueId));
        return mapToPublicationResponse(publication);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PublicationResponse> getPublishedIssues(Pageable pageable) {
        return issuePublicationRepository.findAllByIsPublishedToIndustryTrueOrderByPublishedAtDesc(pageable)
                .map(this::mapToPublicationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getIssueBriefPdfBytes(Long publicationId) {
        IssuePublicationRecord publication = issuePublicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication not found with ID: " + publicationId));

        if (publication.getGeneratedPdfStorageKey() != null) {
            try {
                return fileStorageService.loadDecryptedBytes(publication.getGeneratedPdfStorageKey());
            } catch (Exception e) {
                log.warn("Could not load stored PDF for publication {}, regenerating dynamically: {}", publicationId, e.getMessage());
            }
        }

        // Fallback: dynamically generate on the fly
        try {
            return issuePdfGeneratorService.generateIssueBriefBytes(publication.getIssue(), publication.getCollegeCustomNotes());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF brief: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ProposalResponse submitProposal(Long publicationId, Long industryUserId, ProposalSubmitRequest request) {
        User user = getUserOrThrow(industryUserId);
        validateIndustryRole(user);

        IssuePublicationRecord publication = issuePublicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication not found with ID: " + publicationId));

        if (Boolean.FALSE.equals(publication.getIsPublishedToIndustry())) {
            throw new IllegalStateException("This issue is no longer open for industry proposals.");
        }

        // Fetch company name from IndustryProfile or fallback
        String companyName = user.getName();
        String contactEmail = user.getEmail();
        String contactPhone = user.getPhone();

        Optional<IndustryProfile> profileOpt = industryProfileRepository.findByUserId(industryUserId);
        if (profileOpt.isPresent()) {
            IndustryProfile profile = profileOpt.get();
            if (profile.getCompanyName() != null && !profile.getCompanyName().isBlank()) {
                companyName = profile.getCompanyName();
            }
            if (profile.getContactEmail() != null && !profile.getContactEmail().isBlank()) {
                contactEmail = profile.getContactEmail();
            }
            if (profile.getContactPhone() != null && !profile.getContactPhone().isBlank()) {
                contactPhone = profile.getContactPhone();
            }
        }

        if (request.getContactEmail() != null && !request.getContactEmail().isBlank()) {
            contactEmail = request.getContactEmail();
        }
        if (request.getContactPhone() != null && !request.getContactPhone().isBlank()) {
            contactPhone = request.getContactPhone();
        }

        // Upsert or create proposal
        IndustryProposal proposal = industryProposalRepository
                .findByPublicationIdAndIndustryUserId(publicationId, industryUserId)
                .orElseGet(() -> {
                    IndustryProposal p = new IndustryProposal();
                    p.setPublication(publication);
                    p.setIndustryUser(user);
                    return p;
                });

        proposal.setCompanyName(companyName);
        proposal.setContactEmail(contactEmail);
        proposal.setContactPhone(contactPhone);
        proposal.setProposalTitle(request.getProposalTitle());
        proposal.setProposalSummary(request.getProposalSummary());
        proposal.setProposedBudget(request.getProposedBudget());
        proposal.setProposedTimelineWeeks(request.getProposedTimelineWeeks());
        proposal.setStatus(ProposalStatus.PENDING);
        proposal.setSubmittedAt(LocalDateTime.now());

        IndustryProposal saved = industryProposalRepository.save(proposal);

        // Notify publishing university/college
        if (publication.getPublishedByUser() != null) {
            NotificationEvent notif = new NotificationEvent();
            notif.setEventType("PROPOSAL_SUBMITTED");
            notif.setSource("INDUSTRY_PROPOSAL_PIPELINE");
            notif.setRecipientUserId(publication.getPublishedByUser().getId());
            notif.setTitle("New Industry Proposal Received: " + saved.getProposalTitle());
            notif.setMessage(companyName + " submitted a solution proposal for issue #" + publication.getIssue().getIssueNumber());
            notif.setSeverity("INFO");
            notif.setActionUrl("/university/proposals/" + publicationId);
            notif.setReferenceEntityType("INDUSTRY_PROPOSAL");
            notif.setReferenceEntityId(saved.getId());
            notificationEventPublisher.publishUniversityNotification(notif);
        }

        log.info("Proposal id {} submitted by company '{}' for publication {}", saved.getId(), companyName, publicationId);
        return mapToProposalResponse(saved);
    }

    @Override
    @Transactional
    public ProposalDocumentResponse uploadProposalDocument(Long proposalId, Long industryUserId, String title, ProposalDocType docType, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload file cannot be empty");
        }

        IndustryProposal proposal = industryProposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found with ID: " + proposalId));

        if (!proposal.getIndustryUser().getId().equals(industryUserId)) {
            User user = getUserOrThrow(industryUserId);
            if (!isAdmin(user)) {
                throw new SecurityException("Unauthorized: You do not own this proposal.");
            }
        }

        FileStorageService.StoredFile stored = fileStorageService.storeFile(file, "proposals/documents");

        ProposalDocument doc = new ProposalDocument();
        doc.setProposal(proposal);
        doc.setTitle((title != null && !title.isBlank()) ? title : file.getOriginalFilename());
        doc.setDocType(docType != null ? docType : ProposalDocType.PROPOSAL_MAIN);
        doc.setFileUrl(stored.fileUrl());
        doc.setStorageKey(stored.storageKey());
        doc.setFileSizeBytes(file.getSize());
        doc.setMimeType(file.getContentType());
        doc.setUploadedByName(proposal.getCompanyName());
        doc.setUploadedAt(LocalDateTime.now());

        ProposalDocument saved = proposalDocumentRepository.save(doc);
        log.info("Document '{}' uploaded for proposal {}", saved.getTitle(), proposalId);
        return mapToDocumentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProposalDocumentResponse> getProposalDocuments(Long proposalId, Long userId) {
        return proposalDocumentRepository.findAllByProposalIdOrderByUploadedAtAsc(proposalId)
                .stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProposalResponse> getProposalsForPublication(Long publicationId, Long userId) {
        User user = getUserOrThrow(userId);
        validatePublisherRole(user);

        return industryProposalRepository.findAllByPublicationIdOrderBySubmittedAtDesc(publicationId)
                .stream()
                .map(this::mapToProposalResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProposalResponse> getProposalsByIndustryUser(Long industryUserId, Pageable pageable) {
        return industryProposalRepository.findAllByIndustryUserIdOrderBySubmittedAtDesc(industryUserId, pageable)
                .map(this::mapToProposalResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProposalResponse getProposalById(Long proposalId, Long userId) {
        IndustryProposal proposal = industryProposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found with ID: " + proposalId));
        return mapToProposalResponse(proposal);
    }

    @Override
    @Transactional
    public ProposalResponse acceptProposal(Long proposalId, Long userId, AcceptProposalRequest request) {
        User reviewer = getUserOrThrow(userId);
        validatePublisherRole(reviewer);

        IndustryProposal acceptedProposal = industryProposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found with ID: " + proposalId));

        if (acceptedProposal.getStatus() == ProposalStatus.ACCEPTED) {
            return mapToProposalResponse(acceptedProposal);
        }

        // Accept this proposal
        acceptedProposal.setStatus(ProposalStatus.ACCEPTED);
        acceptedProposal.setReviewedAt(LocalDateTime.now());
        acceptedProposal.setReviewedByUserId(userId);
        if (request != null && request.getReviewerNotes() != null) {
            acceptedProposal.setReviewerNotes(request.getReviewerNotes());
        }

        // Generate unique comms thread ID (strictly on acceptance)
        String threadRefId = "prop-thread-" + UUID.randomUUID();
        acceptedProposal.setThreadRefId(threadRefId);
        IndustryProposal savedAccepted = industryProposalRepository.save(acceptedProposal);

        // Auto-reject other pending proposals for the same publication
        Long pubId = acceptedProposal.getPublication().getId();
        List<IndustryProposal> otherProposals = industryProposalRepository.findAllByPublicationIdOrderBySubmittedAtDesc(pubId);
        for (IndustryProposal other : otherProposals) {
            if (!other.getId().equals(proposalId) && other.getStatus() == ProposalStatus.PENDING) {
                other.setStatus(ProposalStatus.REJECTED);
                other.setReviewedAt(LocalDateTime.now());
                other.setReviewedByUserId(userId);
                other.setReviewerNotes("Another industry proposal was selected for this challenge.");
                industryProposalRepository.save(other);

                // Notify rejected proposal submitter
                NotificationEvent rejEvent = new NotificationEvent();
                rejEvent.setEventType("PROPOSAL_REJECTED");
                rejEvent.setSource("INDUSTRY_PROPOSAL_PIPELINE");
                rejEvent.setRecipientUserId(other.getIndustryUser().getId());
                rejEvent.setTitle("Proposal Update for Issue #" + acceptedProposal.getPublication().getIssue().getIssueNumber());
                rejEvent.setMessage("Another proposal was selected for this issue. Thank you for your submission.");
                rejEvent.setSeverity("INFO");
                notificationEventPublisher.publishIndustryNotification(rejEvent);
            }
        }

        // Seed initial welcome discussion message in the activated chat thread
        ProposalDiscussion initialMessage = new ProposalDiscussion();
        initialMessage.setThreadRefId(threadRefId);
        initialMessage.setProposal(savedAccepted);
        initialMessage.setSenderUserId(reviewer.getId());
        initialMessage.setSenderName(reviewer.getName());
        initialMessage.setSenderRole(reviewer.getRole() != null ? reviewer.getRole().name() : "UNIVERSITY");
        initialMessage.setMessage(String.format("Proposal from %s has been ACCEPTED. Direct collaboration communication thread is now active.", savedAccepted.getCompanyName()));
        proposalDiscussionRepository.save(initialMessage);

        // Notify accepted Industry partner
        NotificationEvent accEvent = new NotificationEvent();
        accEvent.setEventType("PROPOSAL_ACCEPTED");
        accEvent.setSource("INDUSTRY_PROPOSAL_PIPELINE");
        accEvent.setRecipientUserId(savedAccepted.getIndustryUser().getId());
        accEvent.setTitle("Congratulations! Proposal Accepted: " + savedAccepted.getProposalTitle());
        accEvent.setMessage("Your proposal has been accepted by the institution. Direct communication channel is now active.");
        accEvent.setSeverity("SUCCESS");
        accEvent.setActionUrl("/proposals/thread/" + threadRefId);
        accEvent.setReferenceEntityType("INDUSTRY_PROPOSAL");
        accEvent.setReferenceEntityId(savedAccepted.getId());
        notificationEventPublisher.publishIndustryNotification(accEvent);

        log.info("Proposal {} ACCEPTED by user {}. ThreadRefId: {}", proposalId, reviewer.getName(), threadRefId);
        return mapToProposalResponse(savedAccepted);
    }

    @Override
    @Transactional
    public ProposalResponse rejectProposal(Long proposalId, Long userId, String reviewerNotes) {
        User reviewer = getUserOrThrow(userId);
        validatePublisherRole(reviewer);

        IndustryProposal proposal = industryProposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found with ID: " + proposalId));

        proposal.setStatus(ProposalStatus.REJECTED);
        proposal.setReviewedAt(LocalDateTime.now());
        proposal.setReviewedByUserId(userId);
        proposal.setReviewerNotes(reviewerNotes);

        IndustryProposal saved = industryProposalRepository.save(proposal);

        NotificationEvent rejEvent = new NotificationEvent();
        rejEvent.setEventType("PROPOSAL_REJECTED");
        rejEvent.setSource("INDUSTRY_PROPOSAL_PIPELINE");
        rejEvent.setRecipientUserId(saved.getIndustryUser().getId());
        rejEvent.setTitle("Proposal Update for Issue #" + saved.getPublication().getIssue().getIssueNumber());
        rejEvent.setMessage("Your proposal was not selected. " + (reviewerNotes != null ? reviewerNotes : ""));
        rejEvent.setSeverity("INFO");
        notificationEventPublisher.publishIndustryNotification(rejEvent);

        return mapToProposalResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProposalMessageResponse> getProposalThreadMessages(String threadRefId, Long userId) {
        IndustryProposal proposal = industryProposalRepository.findByThreadRefId(threadRefId)
                .orElseThrow(() -> new IllegalArgumentException("Discussion thread not found: " + threadRefId));

        if (proposal.getStatus() != ProposalStatus.ACCEPTED) {
            throw new IllegalStateException("Chat thread is active only for accepted proposals.");
        }

        User user = getUserOrThrow(userId);
        validateThreadAccess(proposal, user);

        return proposalDiscussionRepository.findAllByThreadRefIdOrderByCreatedAtAsc(threadRefId)
                .stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProposalMessageResponse postMessageToThread(String threadRefId, Long userId, ProposalMessageRequest request) {
        IndustryProposal proposal = industryProposalRepository.findByThreadRefId(threadRefId)
                .orElseThrow(() -> new IllegalArgumentException("Discussion thread not found: " + threadRefId));

        if (proposal.getStatus() != ProposalStatus.ACCEPTED) {
            throw new IllegalStateException("Chat thread is active only for accepted proposals.");
        }

        User sender = getUserOrThrow(userId);
        validateThreadAccess(proposal, sender);

        ProposalDiscussion discussion = new ProposalDiscussion();
        discussion.setThreadRefId(threadRefId);
        discussion.setProposal(proposal);
        discussion.setSenderUserId(sender.getId());
        discussion.setSenderName(sender.getName());
        discussion.setSenderRole(sender.getRole() != null ? sender.getRole().name() : "USER");
        discussion.setMessage(request.getMessage());
        discussion.setAttachmentUrl(request.getAttachmentUrl());
        discussion.setAttachmentName(request.getAttachmentName());
        discussion.setCreatedAt(LocalDateTime.now());

        ProposalDiscussion saved = proposalDiscussionRepository.save(discussion);

        // Notify the recipient party
        boolean isIndustrySender = sender.getId().equals(proposal.getIndustryUser().getId());
        Long recipientUserId = isIndustrySender
                ? (proposal.getPublication().getPublishedByUser() != null ? proposal.getPublication().getPublishedByUser().getId() : null)
                : proposal.getIndustryUser().getId();

        if (recipientUserId != null) {
            NotificationEvent event = new NotificationEvent();
            event.setEventType("PROPOSAL_THREAD_MESSAGE");
            event.setSource("INDUSTRY_PROPOSAL_PIPELINE");
            event.setRecipientUserId(recipientUserId);
            event.setTitle("New Message from " + sender.getName());
            event.setMessage(request.getMessage().length() > 80 ? request.getMessage().substring(0, 77) + "..." : request.getMessage());
            event.setSeverity("INFO");
            event.setActionUrl("/proposals/thread/" + threadRefId);

            if (isIndustrySender) {
                notificationEventPublisher.publishUniversityNotification(event);
            } else {
                notificationEventPublisher.publishIndustryNotification(event);
            }
        }

        return mapToMessageResponse(saved);
    }

    // Helper Validators & Mappers

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
    }

    private void validatePublisherRole(User user) {
        Role role = user.getRole();
        if (role != Role.UNIVERSITY && role != Role.HEI_SPOC && role != Role.NODAL_ADMIN && role != Role.ADMIN && role != Role.PLATFORM_ADMIN) {
            throw new SecurityException("Unauthorized: Only University, College SPOC, or Admin can perform this action.");
        }
    }

    private void validateIndustryRole(User user) {
        Role role = user.getRole();
        if (role != Role.INDUSTRY && role != Role.CSR_ADMIN && role != Role.INDUSTRY_MENTOR && role != Role.ADMIN && role != Role.PLATFORM_ADMIN) {
            throw new SecurityException("Unauthorized: Only registered Industry partners can submit proposals.");
        }
    }

    private void validateThreadAccess(IndustryProposal proposal, User user) {
        if (isAdmin(user)) return;
        boolean isIndustrySubmitter = proposal.getIndustryUser().getId().equals(user.getId());
        boolean isPublisher = proposal.getPublication().getPublishedByUser() != null
                && proposal.getPublication().getPublishedByUser().getId().equals(user.getId());
        boolean isUniversityOrSpoc = user.getRole() == Role.UNIVERSITY || user.getRole() == Role.HEI_SPOC;

        if (!isIndustrySubmitter && !isPublisher && !isUniversityOrSpoc) {
            throw new SecurityException("Unauthorized: You are not a participant in this collaboration thread.");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.PLATFORM_ADMIN || user.getRole() == Role.NODAL_ADMIN;
    }

    private PublicationResponse mapToPublicationResponse(IssuePublicationRecord p) {
        PublicationResponse resp = new PublicationResponse();
        resp.setId(p.getId());
        resp.setIsPublishedToIndustry(p.getIsPublishedToIndustry());
        resp.setPublishedAt(p.getPublishedAt());
        resp.setPublishedByName(p.getPublishedByName());
        resp.setPublishedByRole(p.getPublishedByRole());
        resp.setGeneratedPdfUrl(p.getGeneratedPdfUrl());
        resp.setCollegeCustomNotes(p.getCollegeCustomNotes());
        resp.setCollegeGuidelineDocUrl(p.getCollegeGuidelineDocUrl());
        resp.setCollegeGuidelineDocName(p.getCollegeGuidelineDocName());

        if (p.getIssue() != null) {
            GrassrootIssue issue = p.getIssue();
            resp.setIssueId(issue.getId());
            resp.setIssueNumber(issue.getIssueNumber());
            resp.setIssueTitle(issue.getTitle());
            resp.setIssueDescription(issue.getDescription());
            resp.setSector(issue.getSector() != null ? issue.getSector().name() : null);
            resp.setDistrict(issue.getDistrict());
            resp.setBlock(issue.getBlock());
            resp.setPriority(issue.getPriority() != null ? issue.getPriority().name() : null);
            resp.setAssignedHEI(issue.getAssignedHEI());

            if (issue.getSubmitter() != null) {
                resp.setSubmitterName(issue.getSubmitter().getName());
                resp.setSubmitterRole(issue.getSubmitter().getRole() != null ? issue.getSubmitter().getRole().name() : null);
            }
        }

        resp.setProposalsCount(industryProposalRepository.countByPublicationId(p.getId()));

        // Find accepted proposal if any
        List<IndustryProposal> proposals = industryProposalRepository.findAllByPublicationIdOrderBySubmittedAtDesc(p.getId());
        for (IndustryProposal prop : proposals) {
            if (prop.getStatus() == ProposalStatus.ACCEPTED) {
                resp.setAcceptedProposalId(prop.getId());
                break;
            }
        }

        return resp;
    }

    private ProposalResponse mapToProposalResponse(IndustryProposal p) {
        ProposalResponse resp = new ProposalResponse();
        resp.setId(p.getId());
        if (p.getPublication() != null) {
            resp.setPublicationId(p.getPublication().getId());
            if (p.getPublication().getIssue() != null) {
                resp.setIssueId(p.getPublication().getIssue().getId());
                resp.setIssueNumber(p.getPublication().getIssue().getIssueNumber());
                resp.setIssueTitle(p.getPublication().getIssue().getTitle());
            }
        }
        if (p.getIndustryUser() != null) {
            resp.setIndustryUserId(p.getIndustryUser().getId());
        }
        resp.setCompanyName(p.getCompanyName());
        resp.setContactEmail(p.getContactEmail());
        resp.setContactPhone(p.getContactPhone());
        resp.setProposalTitle(p.getProposalTitle());
        resp.setProposalSummary(p.getProposalSummary());
        resp.setProposedBudget(p.getProposedBudget());
        resp.setProposedTimelineWeeks(p.getProposedTimelineWeeks());
        resp.setStatus(p.getStatus());
        resp.setSubmittedAt(p.getSubmittedAt());
        resp.setReviewedAt(p.getReviewedAt());
        resp.setReviewerNotes(p.getReviewerNotes());
        resp.setThreadRefId(p.getThreadRefId());

        if (p.getDocuments() != null && !p.getDocuments().isEmpty()) {
            resp.setDocuments(p.getDocuments().stream().map(this::mapToDocumentResponse).collect(Collectors.toList()));
        }

        return resp;
    }

    private ProposalDocumentResponse mapToDocumentResponse(ProposalDocument d) {
        ProposalDocumentResponse resp = new ProposalDocumentResponse();
        resp.setId(d.getId());
        if (d.getProposal() != null) {
            resp.setProposalId(d.getProposal().getId());
        }
        resp.setTitle(d.getTitle());
        resp.setDocType(d.getDocType());
        resp.setFileUrl(d.getFileUrl());
        resp.setFileSizeBytes(d.getFileSizeBytes());
        resp.setMimeType(d.getMimeType());
        resp.setUploadedByName(d.getUploadedByName());
        resp.setUploadedAt(d.getUploadedAt());
        return resp;
    }

    private ProposalMessageResponse mapToMessageResponse(ProposalDiscussion d) {
        ProposalMessageResponse resp = new ProposalMessageResponse();
        resp.setId(d.getId());
        resp.setThreadRefId(d.getThreadRefId());
        resp.setSenderUserId(d.getSenderUserId());
        resp.setSenderName(d.getSenderName());
        resp.setSenderRole(d.getSenderRole());
        resp.setMessage(d.getMessage());
        resp.setAttachmentUrl(d.getAttachmentUrl());
        resp.setAttachmentName(d.getAttachmentName());
        resp.setCreatedAt(d.getCreatedAt());
        return resp;
    }
}
