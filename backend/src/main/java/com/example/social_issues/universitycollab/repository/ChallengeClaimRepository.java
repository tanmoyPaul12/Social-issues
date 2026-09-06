package com.example.social_issues.universitycollab.repository;

import com.example.social_issues.universitycollab.model.ChallengeClaim;
import com.example.social_issues.universitycollab.model.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeClaimRepository extends JpaRepository<ChallengeClaim, Long> {

    List<ChallengeClaim> findByAisheCodeOrderByCreatedAtDesc(String aisheCode);

    List<ChallengeClaim> findByIssueId(Long issueId);

    Optional<ChallengeClaim> findByIssueIdAndAisheCode(Long issueId, String aisheCode);

    boolean existsByIssueIdAndAisheCodeAndStatus(Long issueId, String aisheCode, ClaimStatus status);
}
