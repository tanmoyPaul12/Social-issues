package com.example.social_issues.industrypartnership.model;

import com.example.social_issues.auth.model.IndustryProfile;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "csr_commitments", indexes = {
    @Index(name = "idx_csr_industry_profile", columnList = "industry_profile_id"),
    @Index(name = "idx_csr_status", columnList = "status"),
    @Index(name = "idx_csr_financial_year", columnList = "financial_year")
})
public class CsrCommitment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_profile_id", nullable = false)
    private IndustryProfile industryProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id")
    private CoFundedPilot pilot;

    @Column(name = "financial_year", length = 20, nullable = false)
    private String financialYear = "2026-2027";

    @Column(name = "total_committed_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalCommittedAmount = BigDecimal.ZERO;

    @Column(name = "total_disbursed_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalDisbursedAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_vii_category", nullable = false, length = 60)
    private CsrCategory scheduleVIICategory = CsrCategory.TECHNOLOGY_INCUBATORS;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private CommitmentStatus status = CommitmentStatus.COMMITTED;

    @Column(name = "csr_project_code", length = 60)
    private String csrProjectCode;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public CsrCommitment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IndustryProfile getIndustryProfile() { return industryProfile; }
    public void setIndustryProfile(IndustryProfile industryProfile) { this.industryProfile = industryProfile; }

    public CoFundedPilot getPilot() { return pilot; }
    public void setPilot(CoFundedPilot pilot) { this.pilot = pilot; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public BigDecimal getTotalCommittedAmount() { return totalCommittedAmount; }
    public void setTotalCommittedAmount(BigDecimal totalCommittedAmount) { this.totalCommittedAmount = totalCommittedAmount; }

    public BigDecimal getTotalDisbursedAmount() { return totalDisbursedAmount; }
    public void setTotalDisbursedAmount(BigDecimal totalDisbursedAmount) { this.totalDisbursedAmount = totalDisbursedAmount; }

    public CsrCategory getScheduleVIICategory() { return scheduleVIICategory; }
    public void setScheduleVIICategory(CsrCategory scheduleVIICategory) { this.scheduleVIICategory = scheduleVIICategory; }

    public CommitmentStatus getStatus() { return status; }
    public void setStatus(CommitmentStatus status) { this.status = status; }

    public String getCsrProjectCode() { return csrProjectCode; }
    public void setCsrProjectCode(String csrProjectCode) { this.csrProjectCode = csrProjectCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
