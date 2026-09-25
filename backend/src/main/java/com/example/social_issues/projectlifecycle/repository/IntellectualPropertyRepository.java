package com.example.social_issues.projectlifecycle.repository;

import com.example.social_issues.projectlifecycle.model.IntellectualPropertyRecord;
import com.example.social_issues.projectlifecycle.model.IpStatus;
import com.example.social_issues.projectlifecycle.model.IpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntellectualPropertyRepository extends JpaRepository<IntellectualPropertyRecord, Long> {

    List<IntellectualPropertyRecord> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<IntellectualPropertyRecord> findByStatus(IpStatus status);

    List<IntellectualPropertyRecord> findByIpType(IpType ipType);

    @Query("""
        SELECT ip FROM IntellectualPropertyRecord ip
        WHERE (:ipType IS NULL OR ip.ipType = :ipType)
          AND (:status IS NULL OR ip.status = :status)
        ORDER BY ip.createdAt DESC
    """)
    List<IntellectualPropertyRecord> findWithFilters(
            @Param("ipType") IpType ipType,
            @Param("status") IpStatus status
    );

    long countByStatus(IpStatus status);

    long countByProjectId(Long projectId);

    @Query("""
        SELECT ip FROM IntellectualPropertyRecord ip
        WHERE ip.createdAt >= :startDate AND ip.createdAt <= :endDate
        ORDER BY ip.createdAt DESC
    """)
    List<IntellectualPropertyRecord> findByDateRange(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate
    );
}
