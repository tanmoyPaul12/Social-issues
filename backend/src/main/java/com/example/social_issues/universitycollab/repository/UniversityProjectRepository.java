package com.example.social_issues.universitycollab.repository;

import com.example.social_issues.universitycollab.model.UniversityProject;
import com.example.social_issues.universitycollab.model.UniversityProjectStage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UniversityProjectRepository extends JpaRepository<UniversityProject, Long> {

    List<UniversityProject> findByAisheCodeOrderByCreatedAtDesc(String aisheCode);

    Page<UniversityProject> findByAisheCode(String aisheCode, Pageable pageable);

    Optional<UniversityProject> findByProjectCode(String projectCode);

    Optional<UniversityProject> findByIssueId(Long issueId);

    long countByAisheCode(String aisheCode);

    long countByAisheCodeAndStage(String aisheCode, UniversityProjectStage stage);

    @Query("SELECT p FROM UniversityProject p LEFT JOIN FETCH p.teamMembers WHERE p.id = :id")
    Optional<UniversityProject> findByIdWithTeamMembers(@Param("id") Long id);
}
