package com.example.social_issues.problemsubmission.repository;

import com.example.social_issues.problemsubmission.model.IssueAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueAttachmentRepository extends JpaRepository<IssueAttachment, Long> {

    List<IssueAttachment> findByIssueId(Long issueId);

    long countByIssueId(Long issueId);

    Optional<IssueAttachment> findByIssueIdAndId(Long issueId, Long id);
}
