package com.example.social_issues.projectlifecycle.service;

import com.example.social_issues.projectlifecycle.dto.ApprovalSignoffDto;
import com.example.social_issues.projectlifecycle.dto.DualClosedLoopStatusDto;
import com.example.social_issues.projectlifecycle.dto.SubmitSignoffRequest;

import java.util.List;

public interface StageApprovalService {

    List<ApprovalSignoffDto> getSignoffsByProject(Long projectId);

    DualClosedLoopStatusDto getDualClosedLoopStatus(Long projectId);

    ApprovalSignoffDto recordSignoff(Long projectId, SubmitSignoffRequest request, Long actorUserId, String fallbackActorName);

    void deleteSignoff(Long id);
}
