package com.example.social_issues.projectlifecycle.repository;

import com.example.social_issues.projectlifecycle.model.ApprovalStage;
import com.example.social_issues.projectlifecycle.model.ApprovalStatus;
import com.example.social_issues.projectlifecycle.model.ApproverRole;
import com.example.social_issues.projectlifecycle.model.StageApprovalSignoff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StageApprovalSignoffRepository extends JpaRepository<StageApprovalSignoff, Long> {

    List<StageApprovalSignoff> findByProjectIdOrderBySignedAtAsc(Long projectId);

    List<StageApprovalSignoff> findByProjectIdAndStage(Long projectId, ApprovalStage stage);

    Optional<StageApprovalSignoff> findByProjectIdAndStageAndApproverRole(
            Long projectId,
            ApprovalStage stage,
            ApproverRole approverRole
    );

    long countByProjectIdAndStageAndApprovalStatus(
            Long projectId,
            ApprovalStage stage,
            ApprovalStatus status
    );

    long countByProjectId(Long projectId);
}
