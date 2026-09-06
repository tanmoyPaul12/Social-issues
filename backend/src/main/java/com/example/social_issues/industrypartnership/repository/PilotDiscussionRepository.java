package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.PilotDiscussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PilotDiscussionRepository extends JpaRepository<PilotDiscussion, Long> {

    List<PilotDiscussion> findByPilotIdOrderByCreatedAtAsc(Long pilotId);

    Page<PilotDiscussion> findByPilotIdOrderByCreatedAtDesc(Long pilotId, Pageable pageable);

    long countByPilotId(Long pilotId);
}
