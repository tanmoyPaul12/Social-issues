package com.example.social_issues.projectlifecycle.repository;

import com.example.social_issues.projectlifecycle.model.MilestoneStatus;
import com.example.social_issues.projectlifecycle.model.ProjectMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMilestoneRepository extends JpaRepository<ProjectMilestone, Long> {

    List<ProjectMilestone> findByProjectIdOrderByMilestoneNumberAsc(Long projectId);

    @Query("""
        SELECT m FROM ProjectMilestone m
        LEFT JOIN FETCH m.deliverables
        WHERE m.id = :id
    """)
    Optional<ProjectMilestone> findByIdWithDeliverables(@Param("id") Long id);

    @Query("""
        SELECT DISTINCT m FROM ProjectMilestone m
        LEFT JOIN FETCH m.deliverables
        WHERE m.projectId = :projectId
        ORDER BY m.milestoneNumber ASC
    """)
    List<ProjectMilestone> findByProjectIdWithDeliverables(@Param("projectId") Long projectId);

    long countByProjectIdAndStatus(Long projectId, MilestoneStatus status);

    long countByProjectId(Long projectId);
}
