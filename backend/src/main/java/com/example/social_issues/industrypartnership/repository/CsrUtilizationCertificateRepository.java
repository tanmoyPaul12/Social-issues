package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.CsrUtilizationCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CsrUtilizationCertificateRepository extends JpaRepository<CsrUtilizationCertificate, Long> {

    List<CsrUtilizationCertificate> findByIndustryProfileIdOrderByCreatedAtDesc(Long industryProfileId);

    List<CsrUtilizationCertificate> findByIndustryProfileIdAndFinancialYearOrderByCreatedAtDesc(
            Long industryProfileId, String financialYear);

    List<CsrUtilizationCertificate> findByIndustryProfileIdAndIsVerifiedOrderByCreatedAtDesc(
            Long industryProfileId, Boolean isVerified);

    Optional<CsrUtilizationCertificate> findByCertificateNumber(String certificateNumber);

    @Query("""
        SELECT COALESCE(SUM(u.certifiedUtilizedAmount), 0)
        FROM CsrUtilizationCertificate u
        WHERE u.industryProfile.id = :profileId AND u.financialYear = :financialYear AND u.isVerified = true
    """)
    BigDecimal sumVerifiedUtilizedAmountByProfileIdAndFy(
            @Param("profileId") Long profileId,
            @Param("financialYear") String financialYear
    );
}
