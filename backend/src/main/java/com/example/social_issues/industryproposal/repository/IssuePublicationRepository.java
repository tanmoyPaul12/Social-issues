package com.example.social_issues.industryproposal.repository;

import com.example.social_issues.industryproposal.model.IssuePublicationRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IssuePublicationRepository extends JpaRepository<IssuePublicationRecord, Long> {

    Optional<IssuePublicationRecord> findByIssueId(Long issueId);

    Optional<IssuePublicationRecord> findByIssueIdAndIsPublishedToIndustryTrue(Long issueId);

    Page<IssuePublicationRecord> findAllByIsPublishedToIndustryTrueOrderByPublishedAtDesc(Pageable pageable);

    boolean existsByIssueIdAndIsPublishedToIndustryTrue(Long issueId);

    @Query("""
        SELECT p FROM IssuePublicationRecord p
        JOIN FETCH p.issue i
        LEFT JOIN FETCH p.publishedByUser u
        WHERE p.id = :id
    """)
    Optional<IssuePublicationRecord> findByIdWithDetails(@Param("id") Long id);
}
