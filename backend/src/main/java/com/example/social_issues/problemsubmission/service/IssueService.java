package com.example.social_issues.problemsubmission.service;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.problemsubmission.dto.*;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import org.springframework.web.multipart.MultipartFile;

public interface IssueService {

    IssueResponse createIssue(Long submitterId, IssueSubmitRequest request, boolean isDraft);

    IssueResponse updateIssue(Long submitterId, Long issueId, IssueUpdateRequest request);

    IssueResponse submitDraftIssue(Long submitterId, Long issueId);

    void deleteIssue(Long submitterId, Long issueId);

    IssueResponse getIssueById(Long issueId);

    IssueResponse getIssueById(Long issueId, UserSummaryDto viewer);

    IssueResponse getIssueByNumber(String issueNumber);

    IssueResponse getIssueByNumber(String issueNumber, UserSummaryDto viewer);

    IssuePageResponse getIssues(
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
    );

    IssuePageResponse getIssues(
            IssueStatus status,
            IssueSector sector,
            IssuePriority priority,
            String district,
            String block,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir,
            UserSummaryDto viewer
    );

    IssuePageResponse getMyIssues(Long submitterId, int page, int size);

    AttachmentResponse addAttachment(Long submitterId, Long issueId, MultipartFile file);

    void deleteAttachment(Long submitterId, Long issueId, Long attachmentId);

    IssueResponse updateIssueStatus(Long reviewerUserId, Long issueId, IssueStatusUpdateRequest request);

    IssueStatsResponse getIssueStats();
}
