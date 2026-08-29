package com.example.social_issues.problemsubmission.repository;

import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrassrootIssueRepository extends JpaRepository<GrassrootIssue, Long> {

    Optional<GrassrootIssue> findByIssueNumber(String issueNumber);

    Page<GrassrootIssue> findBySubmitterIdOrderByCreatedAtDesc(Long submitterId, Pageable pageable);

    @Query("""
        SELECT i FROM GrassrootIssue i
        LEFT JOIN FETCH i.attachments
        WHERE i.id = :id
    """)
    Optional<GrassrootIssue> findByIdWithAttachments(@Param("id") Long id);

    @Query("""
        SELECT i FROM GrassrootIssue i
        WHERE (:status IS NULL OR i.status = :status)
          AND (:sector IS NULL OR i.sector = :sector)
          AND (:priority IS NULL OR i.priority = :priority)
          AND (:district IS NULL OR LOWER(i.district) = LOWER(:district))
          AND (:block IS NULL OR LOWER(i.block) = LOWER(:block))
          AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%'))
                                OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%'))
                                OR LOWER(i.issueNumber) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<GrassrootIssue> findWithFilters(
            @Param("status") IssueStatus status,
            @Param("sector") IssueSector sector,
            @Param("priority") IssuePriority priority,
            @Param("district") String district,
            @Param("block") String block,
            @Param("search") String search,
            Pageable pageable
    );

    long countByStatus(IssueStatus status);

    @Query("SELECT i.sector, COUNT(i) FROM GrassrootIssue i GROUP BY i.sector")
    List<Object[]> countGroupBySector();

    @Query("SELECT i.district, COUNT(i) FROM GrassrootIssue i WHERE i.district IS NOT NULL GROUP BY i.district")
    List<Object[]> countGroupByDistrict();
}
