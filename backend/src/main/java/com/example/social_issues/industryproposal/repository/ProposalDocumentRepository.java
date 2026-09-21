package com.example.social_issues.industryproposal.repository;

import com.example.social_issues.industryproposal.model.ProposalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposalDocumentRepository extends JpaRepository<ProposalDocument, Long> {

    List<ProposalDocument> findAllByProposalId(Long proposalId);

    List<ProposalDocument> findAllByProposalIdOrderByUploadedAtAsc(Long proposalId);
}
