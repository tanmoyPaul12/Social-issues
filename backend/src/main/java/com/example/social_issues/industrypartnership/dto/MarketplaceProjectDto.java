package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.MarketplaceProject;
import com.example.social_issues.industrypartnership.model.MarketplaceStage;
import com.example.social_issues.industrypartnership.model.MarketplaceStatus;
import com.example.social_issues.problemsubmission.model.IssueSector;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

public class MarketplaceProjectDto {

    private Long id;
    private String title;
    private String abstractDescription;
    private IssueSector sector;
    private String sectorName;
    private MarketplaceStage stage;
    private String stageLabel;
    private Long universityId;
    private String universityName;
    private String leadFacultyMentor;
    private String studentLead;
    private Integer teamSize;
    private BigDecimal fundingAskAmount;
    private String fundingAskFormatted;
    private BigDecimal fundingCommittedAmount;
    private String fundingCommittedFormatted;
    private Double fundedPercentage;
    private Integer trlLevel;
    private String targetDistrict;
    private String proposalPdfUrl;
    private String prototypeImageUrl;
    private MarketplaceStatus status;
    private LocalDate closingDate;
    private LocalDateTime createdAt;

    public MarketplaceProjectDto() {}

    public static MarketplaceProjectDto fromEntity(MarketplaceProject entity) {
        if (entity == null) return null;
        MarketplaceProjectDto dto = new MarketplaceProjectDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setAbstractDescription(entity.getAbstractDescription());
        dto.setSector(entity.getSector());
        dto.setSectorName(entity.getSector() != null ? entity.getSector().getDisplayName() : "General Innovation");
        dto.setStage(entity.getStage());
        dto.setStageLabel(formatStageLabel(entity.getStage()));
        dto.setUniversityId(entity.getUniversityId());
        dto.setUniversityName(entity.getUniversityName() != null ? entity.getUniversityName() : "Academic Institution");
        dto.setLeadFacultyMentor(entity.getLeadFacultyMentor() != null ? entity.getLeadFacultyMentor() : "Faculty Project Guide");
        dto.setStudentLead(entity.getStudentLead());
        dto.setTeamSize(entity.getTeamSize() != null ? entity.getTeamSize() : 1);
        
        dto.setFundingAskAmount(entity.getFundingAskAmount() != null ? entity.getFundingAskAmount() : BigDecimal.ZERO);
        dto.setFundingAskFormatted(formatCurrency(entity.getFundingAskAmount()));
        
        dto.setFundingCommittedAmount(entity.getFundingCommittedAmount() != null ? entity.getFundingCommittedAmount() : BigDecimal.ZERO);
        dto.setFundingCommittedFormatted(formatCurrency(entity.getFundingCommittedAmount()));

        if (dto.getFundingAskAmount().compareTo(BigDecimal.ZERO) > 0) {
            double pct = (dto.getFundingCommittedAmount().doubleValue() / dto.getFundingAskAmount().doubleValue()) * 100.0;
            dto.setFundedPercentage(Math.min(100.0, Math.round(pct * 10.0) / 10.0));
        } else {
            dto.setFundedPercentage(0.0);
        }

        dto.setTrlLevel(entity.getTrlLevel() != null ? entity.getTrlLevel() : 4);
        dto.setTargetDistrict(entity.getTargetDistrict() != null ? entity.getTargetDistrict() : "Jharkhand State");
        dto.setProposalPdfUrl(entity.getProposalPdfUrl());
        dto.setPrototypeImageUrl(entity.getPrototypeImageUrl());
        dto.setStatus(entity.getStatus());
        dto.setClosingDate(entity.getClosingDate());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private static String formatStageLabel(MarketplaceStage stage) {
        if (stage == null) return "Prototype";
        return switch (stage) {
            case PROTOTYPE -> "Prototype";
            case NEEDS_FUNDING -> "Needs Funding";
            case NEEDS_MENTOR -> "Needs Mentor";
            case READY_FOR_TESTBED -> "Ready for Testbed";
        };
    }

    private static String formatCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return "₹0";
        double val = amount.doubleValue();
        if (val >= 10000000.0) {
            return String.format(Locale.ENGLISH, "₹%.2f Cr", val / 10000000.0);
        } else if (val >= 100000.0) {
            return String.format(Locale.ENGLISH, "₹%.1f Lakhs", val / 100000.0);
        } else {
            NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.of("en", "IN"));
            return formatter.format(val);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractDescription() { return abstractDescription; }
    public void setAbstractDescription(String abstractDescription) { this.abstractDescription = abstractDescription; }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public String getSectorName() { return sectorName; }
    public void setSectorName(String sectorName) { this.sectorName = sectorName; }

    public MarketplaceStage getStage() { return stage; }
    public void setStage(MarketplaceStage stage) { this.stage = stage; }

    public String getStageLabel() { return stageLabel; }
    public void setStageLabel(String stageLabel) { this.stageLabel = stageLabel; }

    public Long getUniversityId() { return universityId; }
    public void setUniversityId(Long universityId) { this.universityId = universityId; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getLeadFacultyMentor() { return leadFacultyMentor; }
    public void setLeadFacultyMentor(String leadFacultyMentor) { this.leadFacultyMentor = leadFacultyMentor; }

    public String getStudentLead() { return studentLead; }
    public void setStudentLead(String studentLead) { this.studentLead = studentLead; }

    public Integer getTeamSize() { return teamSize; }
    public void setTeamSize(Integer teamSize) { this.teamSize = teamSize; }

    public BigDecimal getFundingAskAmount() { return fundingAskAmount; }
    public void setFundingAskAmount(BigDecimal fundingAskAmount) { this.fundingAskAmount = fundingAskAmount; }

    public String getFundingAskFormatted() { return fundingAskFormatted; }
    public void setFundingAskFormatted(String fundingAskFormatted) { this.fundingAskFormatted = fundingAskFormatted; }

    public BigDecimal getFundingCommittedAmount() { return fundingCommittedAmount; }
    public void setFundingCommittedAmount(BigDecimal fundingCommittedAmount) { this.fundingCommittedAmount = fundingCommittedAmount; }

    public String getFundingCommittedFormatted() { return fundingCommittedFormatted; }
    public void setFundingCommittedFormatted(String fundingCommittedFormatted) { this.fundingCommittedFormatted = fundingCommittedFormatted; }

    public Double getFundedPercentage() { return fundedPercentage; }
    public void setFundedPercentage(Double fundedPercentage) { this.fundedPercentage = fundedPercentage; }

    public Integer getTrlLevel() { return trlLevel; }
    public void setTrlLevel(Integer trlLevel) { this.trlLevel = trlLevel; }

    public String getTargetDistrict() { return targetDistrict; }
    public void setTargetDistrict(String targetDistrict) { this.targetDistrict = targetDistrict; }

    public String getProposalPdfUrl() { return proposalPdfUrl; }
    public void setProposalPdfUrl(String proposalPdfUrl) { this.proposalPdfUrl = proposalPdfUrl; }

    public String getPrototypeImageUrl() { return prototypeImageUrl; }
    public void setPrototypeImageUrl(String prototypeImageUrl) { this.prototypeImageUrl = prototypeImageUrl; }

    public MarketplaceStatus getStatus() { return status; }
    public void setStatus(MarketplaceStatus status) { this.status = status; }

    public LocalDate getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDate closingDate) { this.closingDate = closingDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
