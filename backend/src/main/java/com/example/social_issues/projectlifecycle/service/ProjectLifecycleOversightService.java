package com.example.social_issues.projectlifecycle.service;

import com.example.social_issues.projectlifecycle.dto.ApprovalSignoffDto;
import com.example.social_issues.projectlifecycle.dto.DeliverableDto;
import com.example.social_issues.projectlifecycle.dto.ProjectLifecycleDossierDto;
import com.example.social_issues.projectlifecycle.dto.SubmitSignoffRequest;
import com.example.social_issues.universitycollab.dto.UniversityProjectResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProjectLifecycleOversightService {

    /**
     * Get all active projects statewide with multi-dimensional filtering for Government Oversight
     */
    List<UniversityProjectResponse> getProjectsOversight(
            String aisheCode,
            String district,
            String domain,
            String stage,
            String search
    );

    /**
     * Get paginated active projects statewide with multi-dimensional filtering for Government Oversight
     */
    Page<UniversityProjectResponse> getProjectsOversightPaginated(
            String aisheCode,
            String district,
            String domain,
            String stage,
            String search,
            Pageable pageable
    );

    /**
     * Get 360-degree consolidated dossier for a project (milestones, deliverables, tests, sign-offs, IP)
     */
    ProjectLifecycleDossierDto getProjectDossier(Long projectId);

    /**
     * Find project response by Grassroot Issue ID
     */
    Optional<UniversityProjectResponse> getProjectByIssueId(Long issueId);

    /**
     * Record official Government Nodal Officer stage sign-off & statutory clearance
     */
    ApprovalSignoffDto recordNodalSignoff(
            Long projectId,
            SubmitSignoffRequest request,
            Long nodalUserId,
            String nodalOfficerName
    );

    /**
     * Review / Approve a specific milestone deliverable artifact
     */
    DeliverableDto reviewDeliverable(
            Long deliverableId,
            Boolean isApproved,
            String reviewNotes,
            Long reviewerUserId
    );
}
