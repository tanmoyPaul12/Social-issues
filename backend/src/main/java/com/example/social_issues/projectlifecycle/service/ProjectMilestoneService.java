package com.example.social_issues.projectlifecycle.service;

import com.example.social_issues.projectlifecycle.dto.*;

import java.util.List;

public interface ProjectMilestoneService {

    List<MilestoneDto> getProjectMilestones(Long projectId);

    MilestoneDto getMilestoneById(Long milestoneId);

    MilestoneDto createMilestone(Long projectId, CreateMilestoneRequest request);

    List<MilestoneDto> setupDefaultMilestones(Long projectId);

    DeliverableDto submitDeliverable(Long milestoneId, SubmitDeliverableRequest request, Long submitterId);

    MilestoneDto reviewMilestone(Long milestoneId, ReviewMilestoneRequest request, Long reviewerId);

    void deleteMilestone(Long milestoneId);
}
