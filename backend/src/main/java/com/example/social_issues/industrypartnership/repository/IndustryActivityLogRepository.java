package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.IndustryActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IndustryActivityLogRepository extends JpaRepository<IndustryActivityLog, Long> {

    List<IndustryActivityLog> findTop10ByIndustryProfileIdOrderByCreatedAtDesc(Long industryProfileId);

    Page<IndustryActivityLog> findByIndustryProfileIdOrderByCreatedAtDesc(Long industryProfileId, Pageable pageable);

    int countByIndustryProfileIdAndIsReadFalse(Long industryProfileId);
}
