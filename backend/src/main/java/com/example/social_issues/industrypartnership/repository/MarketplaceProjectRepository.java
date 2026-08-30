package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.MarketplaceProject;

import com.example.social_issues.industrypartnership.model.MarketplaceStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceProjectRepository extends JpaRepository<MarketplaceProject, Long>, JpaSpecificationExecutor<MarketplaceProject> {

    Page<MarketplaceProject> findByStatus(MarketplaceStatus status, Pageable pageable);

    @Query("SELECT DISTINCT p.universityName FROM MarketplaceProject p WHERE p.universityName IS NOT NULL AND p.status = 'PUBLISHED' ORDER BY p.universityName ASC")
    List<String> findDistinctUniversityNames();

    @Query("SELECT p.sector, COUNT(p) FROM MarketplaceProject p WHERE p.status = 'PUBLISHED' GROUP BY p.sector")
    List<Object[]> countProjectsBySector();

    @Query("SELECT p.stage, COUNT(p) FROM MarketplaceProject p WHERE p.status = 'PUBLISHED' GROUP BY p.stage")
    List<Object[]> countProjectsByStage();

    long countByStatus(MarketplaceStatus status);
}
