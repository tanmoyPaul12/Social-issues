package com.example.social_issues.industryproposal.service;

import com.example.social_issues.industryproposal.dto.*;
import com.example.social_issues.industryproposal.model.ProposalDocType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IndustryProposalService {

    PublicationResponse publishIssueToIndustry(Long issueId, Long userId, PublishIssueRequest request, MultipartFile manualGuidelineDoc);

    PublicationResponse togglePublicationStatus(Long publicationId, Long userId, boolean isPublished);

    PublicationResponse getPublicationDetails(Long publicationId);

    PublicationResponse getPublicationByIssueId(Long issueId);

    Page<PublicationResponse> getPublishedIssues(Pageable pageable);

    byte[] getIssueBriefPdfBytes(Long publicationId);

    ProposalResponse submitProposal(Long publicationId, Long industryUserId, ProposalSubmitRequest request);

    ProposalDocumentResponse uploadProposalDocument(Long proposalId, Long industryUserId, String title, ProposalDocType docType, MultipartFile file);

    List<ProposalDocumentResponse> getProposalDocuments(Long proposalId, Long userId);

    List<ProposalResponse> getProposalsForPublication(Long publicationId, Long userId);

    Page<ProposalResponse> getProposalsByIndustryUser(Long industryUserId, Pageable pageable);

    ProposalResponse getProposalById(Long proposalId, Long userId);

    ProposalResponse acceptProposal(Long proposalId, Long userId, AcceptProposalRequest request);

    ProposalResponse rejectProposal(Long proposalId, Long userId, String reviewerNotes);

    List<ProposalMessageResponse> getProposalThreadMessages(String threadRefId, Long userId);

    ProposalMessageResponse postMessageToThread(String threadRefId, Long userId, ProposalMessageRequest request);
}
