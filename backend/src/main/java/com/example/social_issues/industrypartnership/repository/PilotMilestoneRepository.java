package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.MilestoneStatus;
import com.example.social_issues.industrypartnership.model.PilotMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PilotMilestoneRepository extends JpaRepository<PilotMilestone, Long> {

    List<PilotMilestone> findByPilotIdOrderByMilestoneNumberAsc(Long pilotId);

    long countByPilotId(Long pilotId);

    long countByPilotIdAndStatus(Long pilotId, MilestoneStatus status);
}
