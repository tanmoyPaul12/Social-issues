package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.problemsubmission.model.IssueSector;
import java.math.BigDecimal;

public class SectorEngagementDto {

    private IssueSector sector;
    private String sectorName;
    private BigDecimal committedAmount = BigDecimal.ZERO;
    private long projectCount = 0L;
    private double percentage = 0.0;

    public SectorEngagementDto() {}

    public SectorEngagementDto(IssueSector sector, long projectCount, BigDecimal committedAmount) {
        this.sector = sector;
        this.sectorName = sector != null ? sector.name() : "OTHER";
        this.projectCount = projectCount;
        this.committedAmount = committedAmount != null ? committedAmount : BigDecimal.ZERO;
    }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public String getSectorName() { return sectorName; }
    public void setSectorName(String sectorName) { this.sectorName = sectorName; }

    public BigDecimal getCommittedAmount() { return committedAmount; }
    public void setCommittedAmount(BigDecimal committedAmount) { this.committedAmount = committedAmount; }

    public long getProjectCount() { return projectCount; }
    public void setProjectCount(long projectCount) { this.projectCount = projectCount; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
