package com.example.social_issues.projectlifecycle.service.impl;

import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.projectlifecycle.dto.*;
import com.example.social_issues.projectlifecycle.model.*;
import com.example.social_issues.projectlifecycle.repository.ProjectDeliverableRepository;
import com.example.social_issues.projectlifecycle.service.*;
import com.example.social_issues.universitycollab.dto.UniversityProjectResponse;
import com.example.social_issues.universitycollab.model.UniversityProject;
import com.example.social_issues.universitycollab.model.UniversityProjectStage;
import com.example.social_issues.universitycollab.repository.UniversityProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectLifecycleOversightServiceImpl implements ProjectLifecycleOversightService {

    private static final Logger log = LoggerFactory.getLogger(ProjectLifecycleOversightServiceImpl.class);

    private final UniversityProjectRepository projectRepository;
    private final ProjectMilestoneService milestoneService;
    private final ProjectTestingService testingService;
    private final StageApprovalService stageApprovalService;
    private final IntellectualPropertyService ipService;
    private final ProjectDeliverableRepository deliverableRepository;

    public ProjectLifecycleOversightServiceImpl(
            UniversityProjectRepository projectRepository,
            ProjectMilestoneService milestoneService,
            ProjectTestingService testingService,
            StageApprovalService stageApprovalService,
            IntellectualPropertyService ipService,
            ProjectDeliverableRepository deliverableRepository
    ) {
        this.projectRepository = projectRepository;
        this.milestoneService = milestoneService;
        this.testingService = testingService;
        this.stageApprovalService = stageApprovalService;
        this.ipService = ipService;
        this.deliverableRepository = deliverableRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UniversityProjectResponse> getProjectsOversight(
            String aisheCode,
            String district,
            String domain,
            String stage,
            String search
    ) {
        return filterProjects(aisheCode, district, domain, stage, search);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UniversityProjectResponse> getProjectsOversightPaginated(
            String aisheCode,
            String district,
            String domain,
            String stage,
            String search,
            Pageable pageable
    ) {
        log.info("Fetching paginated projects oversight: aisheCode={}, district={}, domain={}, stage={}, search={}, page={}, size={}",
                aisheCode, district, domain, stage, search, pageable.getPageNumber(), pageable.getPageSize());

        List<UniversityProjectResponse> filtered = filterProjects(aisheCode, district, domain, stage, search);
        int total = filtered.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);

        List<UniversityProjectResponse> pageContent = (start <= total) ? filtered.subList(start, end) : List.of();
        return new PageImpl<>(pageContent, pageable, total);
    }

    private List<UniversityProjectResponse> filterProjects(
            String aisheCode,
            String district,
            String domain,
            String stage,
            String search
    ) {
        List<UniversityProject> allProjects = projectRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        return allProjects.stream()
                .filter(p -> {
                    // Filter by AISHE if specified and not ALL
                    if (aisheCode != null && !aisheCode.isBlank() && !aisheCode.equalsIgnoreCase("ALL")) {
                        if (!aisheCode.equalsIgnoreCase(p.getAisheCode())) return false;
                    }
                    // Filter by District if specified and not All
                    if (district != null && !district.isBlank() && !district.equalsIgnoreCase("All 24 Districts") && !district.equalsIgnoreCase("ALL")) {
                        if (p.getDistrict() == null || !p.getDistrict().equalsIgnoreCase(district)) return false;
                    }
                    // Filter by Domain if specified and not All
                    if (domain != null && !domain.isBlank() && !domain.equalsIgnoreCase("ALL")) {
                        if (p.getDomain() == null || !p.getDomain().toLowerCase().contains(domain.toLowerCase())) return false;
                    }
                    // Filter by Stage if specified and not ALL
                    if (stage != null && !stage.isBlank() && !stage.equalsIgnoreCase("ALL")) {
                        try {
                            UniversityProjectStage sEnum = UniversityProjectStage.valueOf(stage.toUpperCase());
                            if (p.getStage() != sEnum) return false;
                        } catch (IllegalArgumentException ignored) {}
                    }
                    // Search query filter (title, projectCode, facultyMentor, studentLead)
                    if (search != null && !search.isBlank()) {
                        String q = search.trim().toLowerCase();
                        boolean match = (p.getTitle() != null && p.getTitle().toLowerCase().contains(q)) ||
                                        (p.getProjectCode() != null && p.getProjectCode().toLowerCase().contains(q)) ||
                                        (p.getLeadFacultyMentor() != null && p.getLeadFacultyMentor().toLowerCase().contains(q)) ||
                                        (p.getLeadStudentInnovator() != null && p.getLeadStudentInnovator().toLowerCase().contains(q)) ||
                                        (p.getUniversityName() != null && p.getUniversityName().toLowerCase().contains(q));
                        if (!match) return false;
                    }
                    return true;
                })
                .map(UniversityProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectLifecycleDossierDto getProjectDossier(Long projectId) {
        log.info("Compiling 360-degree project dossier for project ID: {}", projectId);

        UniversityProject project = projectRepository.findByIdWithTeamMembers(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("University project not found with ID: " + projectId));

        ProjectLifecycleDossierDto dossier = new ProjectLifecycleDossierDto();
        dossier.setProject(UniversityProjectResponse.fromEntity(project));

        // 1. Milestones & Deliverables
        List<MilestoneDto> milestones = milestoneService.getProjectMilestones(projectId);
        dossier.setMilestones(milestones);

        long totalDeliv = 0;
        long approvedDeliv = 0;
        for (MilestoneDto m : milestones) {
            if (m.getDeliverables() != null) {
                totalDeliv += m.getDeliverables().size();
                approvedDeliv += m.getDeliverables().stream().filter(d -> Boolean.TRUE.equals(d.getIsApproved())).count();
            }
        }
        dossier.setTotalDeliverablesCount(totalDeliv);
        dossier.setApprovedDeliverablesCount(approvedDeliv);

        // 2. Testing Outcomes & TRL
        List<TestResultDto> testResults = testingService.getTestResultsByProject(projectId);
        dossier.setTestResults(testResults);
        dossier.setHighestTrl(testingService.getProjectHighestTrl(projectId));

        // 3. Stage Sign-offs & Dual Closed-Loop
        List<ApprovalSignoffDto> signoffs = stageApprovalService.getSignoffsByProject(projectId);
        dossier.setSignoffs(signoffs);
        DualClosedLoopStatusDto closedLoop = stageApprovalService.getDualClosedLoopStatus(projectId);
        dossier.setClosedLoopStatus(closedLoop);

        // Check if Nodal sign-off is pending for final stage
        boolean hasNodalSignoff = signoffs.stream().anyMatch(s -> 
            s.getApproverRole() == ApproverRole.NODAL_GOVT_OFFICER && s.getApprovalStatus() == ApprovalStatus.APPROVED
        );
        dossier.setNodalSignoffPending(!hasNodalSignoff);

        // 4. IP Records & Patents
        List<IpRecordDto> ipRecords = ipService.getIpRecordsByProject(projectId);
        dossier.setIpRecords(ipRecords);

        return dossier;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UniversityProjectResponse> getProjectByIssueId(Long issueId) {
        return projectRepository.findByIssueId(issueId)
                .map(UniversityProjectResponse::fromEntity);
    }

    @Override
    @Transactional
    public ApprovalSignoffDto recordNodalSignoff(
            Long projectId,
            SubmitSignoffRequest request,
            Long nodalUserId,
            String nodalOfficerName
    ) {
        log.info("Recording Government Nodal Signoff for project ID: {} [Stage: {}, Status: {}]",
                projectId, request.getStage(), request.getApprovalStatus());

        // Enforce role to NODAL_GOVT_OFFICER
        request.setApproverRole(ApproverRole.NODAL_GOVT_OFFICER);
        if (request.getApproverName() == null || request.getApproverName().isBlank()) {
            request.setApproverName(nodalOfficerName);
        }

        return stageApprovalService.recordSignoff(projectId, request, nodalUserId, nodalOfficerName);
    }

    @Override
    @Transactional
    public DeliverableDto reviewDeliverable(
            Long deliverableId,
            Boolean isApproved,
            String reviewNotes,
            Long reviewerUserId
    ) {
        log.info("Reviewing deliverable ID: {} -> approved: {}", deliverableId, isApproved);

        ProjectDeliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with ID: " + deliverableId));

        deliverable.setIsApproved(Boolean.TRUE.equals(isApproved));
        if (reviewNotes != null && !reviewNotes.isBlank()) {
            deliverable.setReviewNotes(reviewNotes);
        }

        ProjectDeliverable saved = deliverableRepository.save(deliverable);
        return DeliverableDto.fromEntity(saved);
    }
}
