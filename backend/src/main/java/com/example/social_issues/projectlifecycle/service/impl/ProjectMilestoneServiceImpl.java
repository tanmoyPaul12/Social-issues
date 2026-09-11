package com.example.social_issues.projectlifecycle.service.impl;

import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.projectlifecycle.dto.*;
import com.example.social_issues.projectlifecycle.model.DeliverableType;
import com.example.social_issues.projectlifecycle.model.MilestoneStatus;
import com.example.social_issues.projectlifecycle.model.ProjectDeliverable;
import com.example.social_issues.projectlifecycle.model.ProjectMilestone;
import com.example.social_issues.projectlifecycle.repository.ProjectDeliverableRepository;
import com.example.social_issues.projectlifecycle.repository.ProjectMilestoneRepository;
import com.example.social_issues.projectlifecycle.service.ProjectMilestoneService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectMilestoneServiceImpl implements ProjectMilestoneService {

    private static final Logger log = LoggerFactory.getLogger(ProjectMilestoneServiceImpl.class);

    private final ProjectMilestoneRepository milestoneRepository;
    private final ProjectDeliverableRepository deliverableRepository;

    public ProjectMilestoneServiceImpl(
            ProjectMilestoneRepository milestoneRepository,
            ProjectDeliverableRepository deliverableRepository
    ) {
        this.milestoneRepository = milestoneRepository;
        this.deliverableRepository = deliverableRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneDto> getProjectMilestones(Long projectId) {
        List<ProjectMilestone> milestones = milestoneRepository.findByProjectIdWithDeliverables(projectId);
        if (milestones.isEmpty()) {
            // Check without fetch join in case empty
            milestones = milestoneRepository.findByProjectIdOrderByMilestoneNumberAsc(projectId);
        }
        return milestones.stream()
                .map(MilestoneDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MilestoneDto getMilestoneById(Long milestoneId) {
        ProjectMilestone milestone = milestoneRepository.findByIdWithDeliverables(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));
        return MilestoneDto.fromEntity(milestone);
    }

    @Override
    @Transactional
    public MilestoneDto createMilestone(Long projectId, CreateMilestoneRequest request) {
        ProjectMilestone milestone = new ProjectMilestone();
        milestone.setProjectId(projectId);
        milestone.setMilestoneNumber(request.getMilestoneNumber());
        milestone.setTitle(request.getTitle());
        milestone.setDeliverableSummary(request.getDeliverableSummary());
        milestone.setTargetDate(request.getTargetDate());
        milestone.setTrancheAmount(request.getTrancheAmount() != null ? request.getTrancheAmount() : BigDecimal.ZERO);
        milestone.setStatus(MilestoneStatus.UPCOMING);
        milestone.setCompletionPercentage(0);

        ProjectMilestone saved = milestoneRepository.save(milestone);
        log.info("Created milestone #{} for project id: {}", saved.getMilestoneNumber(), projectId);
        return MilestoneDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public List<MilestoneDto> setupDefaultMilestones(Long projectId) {
        List<ProjectMilestone> existing = milestoneRepository.findByProjectIdOrderByMilestoneNumberAsc(projectId);
        if (!existing.isEmpty()) {
            return existing.stream().map(MilestoneDto::fromEntity).toList();
        }

        List<ProjectMilestone> defaults = new ArrayList<>();
        LocalDate now = LocalDate.now();

        // 1. Milestone 1: Requirements & Team Setup (TRL 2-3)
        ProjectMilestone m1 = new ProjectMilestone();
        m1.setProjectId(projectId);
        m1.setMilestoneNumber(1);
        m1.setTitle("Requirements Engineering & Multi-disciplinary Team Architecture");
        m1.setDeliverableSummary("Formalized problem decomposition, faculty & student roles allocation, and baseline field feasibility assessment.");
        m1.setTargetDate(now.plusDays(30));
        m1.setStatus(MilestoneStatus.IN_PROGRESS);
        m1.setCompletionPercentage(50);
        m1.setTrancheAmount(BigDecimal.valueOf(50000));
        defaults.add(m1);

        // 2. Milestone 2: Laboratory Prototyping (TRL 4-5)
        ProjectMilestone m2 = new ProjectMilestone();
        m2.setProjectId(projectId);
        m2.setMilestoneNumber(2);
        m2.setTitle("Laboratory Sandbox Prototyping & Algorithmic Simulation");
        m2.setDeliverableSummary("Benchtop hardware schematic / working software MVP demonstration and lab test verification reports.");
        m2.setTargetDate(now.plusDays(75));
        m2.setStatus(MilestoneStatus.UPCOMING);
        m2.setCompletionPercentage(0);
        m2.setTrancheAmount(BigDecimal.valueOf(100000));
        defaults.add(m2);

        // 3. Milestone 3: Field Pilot Deployment (TRL 6-7)
        ProjectMilestone m3 = new ProjectMilestone();
        m3.setProjectId(projectId);
        m3.setMilestoneNumber(3);
        m3.setTitle("On-Ground Field Pilot & Sensor Telemetry Validation");
        m3.setDeliverableSummary("District field trial deployment, community usage metrics, and environmental sensor telemetry collection.");
        m3.setTargetDate(now.plusDays(120));
        m3.setStatus(MilestoneStatus.UPCOMING);
        m3.setCompletionPercentage(0);
        m3.setTrancheAmount(BigDecimal.valueOf(100000));
        defaults.add(m3);

        // 4. Milestone 4: Citizen Verification & Handover (TRL 8-9)
        ProjectMilestone m4 = new ProjectMilestone();
        m4.setProjectId(projectId);
        m4.setMilestoneNumber(4);
        m4.setTitle("Citizen Field Verification & Municipal ULB/PRI Handover");
        m4.setDeliverableSummary("Citizen satisfaction validation, local nodal officer sign-off, NEP 2020 ABC credit issuance, and IP disclosure.");
        m4.setTargetDate(now.plusDays(150));
        m4.setStatus(MilestoneStatus.UPCOMING);
        m4.setCompletionPercentage(0);
        m4.setTrancheAmount(BigDecimal.valueOf(50000));
        defaults.add(m4);

        List<ProjectMilestone> saved = milestoneRepository.saveAll(defaults);
        log.info("Initialized default 4-stage milestone roadmap for project id: {}", projectId);
        return saved.stream().map(MilestoneDto::fromEntity).toList();
    }

    @Override
    @Transactional
    public DeliverableDto submitDeliverable(Long milestoneId, SubmitDeliverableRequest request, Long submitterId) {
        ProjectMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));

        ProjectDeliverable deliverable = new ProjectDeliverable();
        deliverable.setMilestone(milestone);
        deliverable.setTitle(request.getTitle());
        deliverable.setDescription(request.getDescription());
        deliverable.setDeliverableType(request.getDeliverableType() != null ? request.getDeliverableType() : DeliverableType.OTHER);
        deliverable.setFileUrl(request.getFileUrl());
        deliverable.setFileStorageKey(request.getFileStorageKey());
        deliverable.setExternalRepoUrl(request.getExternalRepoUrl());
        deliverable.setSubmittedByUserId(submitterId);
        deliverable.setSubmittedByName(request.getSubmittedByName());
        deliverable.setIsApproved(false);

        ProjectDeliverable saved = deliverableRepository.save(deliverable);

        // Auto-update milestone status to SUBMITTED_FOR_REVIEW if currently in progress
        if (milestone.getStatus() == MilestoneStatus.UPCOMING || milestone.getStatus() == MilestoneStatus.IN_PROGRESS) {
            milestone.setStatus(MilestoneStatus.SUBMITTED_FOR_REVIEW);
            milestone.setCompletionPercentage(Math.max(milestone.getCompletionPercentage(), 75));
            milestoneRepository.save(milestone);
        }

        log.info("Submitted deliverable '{}' for milestone id: {}", saved.getTitle(), milestoneId);
        return DeliverableDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public MilestoneDto reviewMilestone(Long milestoneId, ReviewMilestoneRequest request, Long reviewerId) {
        ProjectMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));

        milestone.setStatus(request.getStatus());
        milestone.setReviewRemarks(request.getReviewRemarks());
        milestone.setReviewedByUserId(reviewerId);
        milestone.setReviewedAt(LocalDateTime.now());

        if (request.getCompletionPercentage() != null) {
            milestone.setCompletionPercentage(request.getCompletionPercentage());
        }

        if (request.getStatus() == MilestoneStatus.APPROVED) {
            milestone.setCompletedDate(LocalDate.now());
            milestone.setCompletionPercentage(100);

            // Mark all child deliverables as approved
            if (milestone.getDeliverables() != null) {
                for (ProjectDeliverable d : milestone.getDeliverables()) {
                    d.setIsApproved(true);
                }
            }
        }

        ProjectMilestone updated = milestoneRepository.save(milestone);
        log.info("Reviewed milestone id: {} -> status: {}", milestoneId, updated.getStatus());
        return MilestoneDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteMilestone(Long milestoneId) {
        ProjectMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));
        milestoneRepository.delete(milestone);
        log.info("Deleted milestone id: {}", milestoneId);
    }
}
