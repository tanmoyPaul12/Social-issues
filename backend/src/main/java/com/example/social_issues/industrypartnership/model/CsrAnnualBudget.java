package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "csr_annual_budgets", indexes = {
    @Index(name = "idx_csr_budget_profile_fy", columnList = "industry_profile_id, financial_year", unique = true)
})
public class CsrAnnualBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @Column(name = "financial_year", length = 20, nullable = false)
    private String financialYear;

    @Column(name = "mandatory_csr_obligation", precision = 18, scale = 2, nullable = false)
    private BigDecimal mandatoryCsrObligation = BigDecimal.ZERO;

    @Column(name = "earmarked_for_heis", precision = 18, scale = 2, nullable = false)
    private BigDecimal earmarkedForHeis = BigDecimal.ZERO;

    @Column(name = "total_committed_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalCommittedAmount = BigDecimal.ZERO;

    @Column(name = "total_disbursed_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalDisbursedAmount = BigDecimal.ZERO;

    @Column(name = "unspent_carried_forward", precision = 18, scale = 2, nullable = false)
    private BigDecimal unspentCarriedForward = BigDecimal.ZERO;

    @Column(name = "is_board_approved", nullable = false)
    private Boolean isBoardApproved = true;

    @Column(name = "board_approval_date")
    private LocalDateTime boardApprovalDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public CsrAnnualBudget() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public BigDecimal getMandatoryCsrObligation() { return mandatoryCsrObligation; }
    public void setMandatoryCsrObligation(BigDecimal mandatoryCsrObligation) { this.mandatoryCsrObligation = mandatoryCsrObligation; }

    public BigDecimal getEarmarkedForHeis() { return earmarkedForHeis; }
    public void setEarmarkedForHeis(BigDecimal earmarkedForHeis) { this.earmarkedForHeis = earmarkedForHeis; }

    public BigDecimal getTotalCommittedAmount() { return totalCommittedAmount; }
    public void setTotalCommittedAmount(BigDecimal totalCommittedAmount) { this.totalCommittedAmount = totalCommittedAmount; }

    public BigDecimal getTotalDisbursedAmount() { return totalDisbursedAmount; }
    public void setTotalDisbursedAmount(BigDecimal totalDisbursedAmount) { this.totalDisbursedAmount = totalDisbursedAmount; }

    public BigDecimal getUnspentCarriedForward() { return unspentCarriedForward; }
    public void setUnspentCarriedForward(BigDecimal unspentCarriedForward) { this.unspentCarriedForward = unspentCarriedForward; }

    public Boolean getIsBoardApproved() { return isBoardApproved; }
    public void setIsBoardApproved(Boolean isBoardApproved) { this.isBoardApproved = isBoardApproved; }

    public LocalDateTime getBoardApprovalDate() { return boardApprovalDate; }
    public void setBoardApprovalDate(LocalDateTime boardApprovalDate) { this.boardApprovalDate = boardApprovalDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
