package com.example.social_issues.industryproposal.repository;

import com.example.social_issues.industryproposal.model.IndustryProposal;
import com.example.social_issues.industryproposal.model.ProposalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IndustryProposalRepository extends JpaRepository<IndustryProposal, Long> {

    List<IndustryProposal> findAllByPublicationIdOrderBySubmittedAtDesc(Long publicationId);

    Page<IndustryProposal> findAllByIndustryUserIdOrderBySubmittedAtDesc(Long industryUserId, Pageable pageable);

    Optional<IndustryProposal> findByPublicationIdAndIndustryUserId(Long publicationId, Long industryUserId);

    Optional<IndustryProposal> findByThreadRefId(String threadRefId);

    long countByPublicationId(Long publicationId);

    long countByPublicationIdAndStatus(Long publicationId, ProposalStatus status);

    @Query("""
        SELECT p FROM IndustryProposal p
        LEFT JOIN FETCH p.documents
        WHERE p.id = :id
    """)
    Optional<IndustryProposal> findByIdWithDocuments(@Param("id") Long id);

    @Query("""
        SELECT p FROM IndustryProposal p
        JOIN FETCH p.publication pub
        JOIN FETCH pub.issue i
        WHERE p.industryUser.id = :userId
        ORDER BY p.submittedAt DESC
    """)
    List<IndustryProposal> findAllByIndustryUserIdWithPublication(@Param("userId") Long userId);
}
