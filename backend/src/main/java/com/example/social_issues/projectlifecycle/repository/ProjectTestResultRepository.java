package com.example.social_issues.projectlifecycle.repository;

import com.example.social_issues.projectlifecycle.model.ProjectTestResult;
import com.example.social_issues.projectlifecycle.model.TestPassStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectTestResultRepository extends JpaRepository<ProjectTestResult, Long> {

    List<ProjectTestResult> findByProjectIdOrderByTestDateDesc(Long projectId);

    List<ProjectTestResult> findByProjectIdAndPassStatus(Long projectId, TestPassStatus passStatus);

    @Query("SELECT MAX(t.trlLevel) FROM ProjectTestResult t WHERE t.projectId = :projectId AND t.passStatus = 'PASSED'")
    Optional<Integer> findMaxVerifiedTrlLevel(@Param("projectId") Long projectId);

    long countByProjectId(Long projectId);
}
