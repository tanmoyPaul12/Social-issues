package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.CsrAnnualBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CsrAnnualBudgetRepository extends JpaRepository<CsrAnnualBudget, Long> {

    Optional<CsrAnnualBudget> findByIndustryProfileIdAndFinancialYear(Long industryProfileId, String financialYear);

    List<CsrAnnualBudget> findByIndustryProfileIdOrderByFinancialYearDesc(Long industryProfileId);
}
