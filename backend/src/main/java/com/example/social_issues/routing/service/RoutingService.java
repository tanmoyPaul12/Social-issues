package com.example.social_issues.routing.service;

import com.example.social_issues.problemsubmission.dto.IssuePageResponse;
import com.example.social_issues.problemsubmission.dto.IssueResponse;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.routing.dto.TriageAssignRequest;
import com.example.social_issues.routing.dto.TriageRejectRequest;
import com.example.social_issues.routing.dto.TriageValidateRequest;

import java.util.List;

public interface RoutingService {

    /**
     * Validate and confirm citizen grievance for official nodal processing.
     * Transitions status to TRIAGED and sets validationStatus to PASS.
     */
    IssueResponse validateAndConfirm(Long reviewerId, Long issueId, TriageValidateRequest request);

    /**
     * Route and assign citizen grievance to target Higher Education Institution (HEI).
     * Transitions status to ASSIGNED_HEI and logs audit trail.
     */
    IssueResponse assignToHEI(Long reviewerId, Long issueId, TriageAssignRequest request);

    /**
     * Reject citizen grievance with reason and update audit log.
     * Transitions status to REJECTED.
     */
    IssueResponse rejectIssue(Long reviewerId, Long issueId, TriageRejectRequest request);

    /**
     * Revoke and recall problem statement allocation from a university back to the statewide pool.
     * Transitions status back to TRIAGED, clears assignedHEI, and logs Nodal revocation audit note.
     */
    IssueResponse revokeAllocation(Long reviewerId, Long issueId, com.example.social_issues.routing.dto.TriageRevokeRequest request);

    /**
     * Get paginated triage queue for Nodal and Government officers.
     */
    IssuePageResponse getTriageQueue(IssueStatus status, String district, IssueSector sector, IssuePriority priority, int page, int size);

    /**
     * Get unpaginated triage queue list for dashboard feeds.
     */
    List<IssueResponse> getTriageQueueList(IssueStatus status, String district, IssueSector sector, IssuePriority priority);
}
