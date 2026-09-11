package com.example.social_issues.projectlifecycle.repository;

import com.example.social_issues.projectlifecycle.model.DeliverableType;
import com.example.social_issues.projectlifecycle.model.ProjectDeliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectDeliverableRepository extends JpaRepository<ProjectDeliverable, Long> {

    List<ProjectDeliverable> findByMilestoneId(Long milestoneId);

    List<ProjectDeliverable> findByMilestoneIdAndDeliverableType(Long milestoneId, DeliverableType deliverableType);
}
