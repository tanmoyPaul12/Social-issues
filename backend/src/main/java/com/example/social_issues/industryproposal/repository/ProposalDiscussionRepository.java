package com.example.social_issues.industryproposal.repository;

import com.example.social_issues.industryproposal.model.ProposalDiscussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposalDiscussionRepository extends JpaRepository<ProposalDiscussion, Long> {

    List<ProposalDiscussion> findAllByThreadRefIdOrderByCreatedAtAsc(String threadRefId);

    List<ProposalDiscussion> findAllByProposalIdOrderByCreatedAtAsc(Long proposalId);
}
