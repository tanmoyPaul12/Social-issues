package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.CoFundedPilot;
import com.example.social_issues.industrypartnership.model.PilotHealthStatus;
import com.example.social_issues.industrypartnership.model.PilotStage;
import com.example.social_issues.industrypartnership.model.PilotStatus;
import com.example.social_issues.problemsubmission.model.IssueSector;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ActivePilotSummaryDto {

    private Long id;
    private Long projectId;
    private String title;
    private String abstractDescription;
    private IssueSector sector;
    private String sectorName;
    private Long universityId;
    private String universityName;
    private String facultyLeadName;
    private String studentLeadName;
    private String corporateMentorName;
    private String targetDistrict;

    private PilotStage stage;
    private String stageLabel;
    private PilotStatus status;
    private String statusLabel;
    private PilotHealthStatus healthStatus;
    private String healthStatusLabel;

    private Integer currentMilestone;
    private Integer totalMilestones;
    private Integer progressPercentage;

    private BigDecimal totalBudget;
    private String totalBudgetFormatted;
    private BigDecimal disbursedBudget;
    private String disbursedBudgetFormatted;
    private Double disbursedPercentage;

    private LocalDate nextDeliverableDate;
    private LocalDate targetCompletionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ActivePilotSummaryDto() {}

    public static ActivePilotSummaryDto fromEntity(CoFundedPilot entity) {
        if (entity == null) return null;
        ActivePilotSummaryDto dto = new ActivePilotSummaryDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setAbstractDescription(entity.getAbstractDescription());
        dto.setSector(entity.getSector());
        dto.setSectorName(entity.getSector() != null ? entity.getSector().getDisplayName() : "General Innovation");
        dto.setUniversityId(entity.getUniversityId());
        dto.setUniversityName(entity.getUniversityName() != null ? entity.getUniversityName() : "Academic Institution");
        dto.setFacultyLeadName(entity.getFacultyLeadName());
        dto.setStudentLeadName(entity.getStudentLeadName());
        dto.setCorporateMentorName(entity.getCorporateMentorName());
        dto.setTargetDistrict(entity.getTargetDistrict());

        dto.setStage(entity.getStage());
        dto.setStageLabel(formatStageLabel(entity.getStage()));
        dto.setStatus(entity.getStatus());
        dto.setStatusLabel(formatStatusLabel(entity.getStatus()));
        dto.setHealthStatus(entity.getHealthStatus());
        dto.setHealthStatusLabel(formatHealthStatusLabel(entity.getHealthStatus()));

        dto.setCurrentMilestone(entity.getCurrentMilestone() != null ? entity.getCurrentMilestone() : 1);
        dto.setTotalMilestones(entity.getTotalMilestones() != null ? entity.getTotalMilestones() : 4);
        dto.setProgressPercentage(entity.getProgressPercentage() != null ? entity.getProgressPercentage() : 0);

        BigDecimal budget = entity.getTotalBudget() != null ? entity.getTotalBudget() : BigDecimal.ZERO;
        BigDecimal disbursed = entity.getDisbursedBudget() != null ? entity.getDisbursedBudget() : BigDecimal.ZERO;
        dto.setTotalBudget(budget);
        dto.setTotalBudgetFormatted(formatCurrency(budget));
        dto.setDisbursedBudget(disbursed);
        dto.setDisbursedBudgetFormatted(formatCurrency(disbursed));

        if (budget.compareTo(BigDecimal.ZERO) > 0) {
            double pct = disbursed.doubleValue() / budget.doubleValue() * 100.0;
            dto.setDisbursedPercentage(Math.min(100.0, Math.round(pct * 10.0) / 10.0));
        } else {
            dto.setDisbursedPercentage(0.0);
        }

        dto.setNextDeliverableDate(entity.getNextDeliverableDate());
        dto.setTargetCompletionDate(entity.getTargetCompletionDate());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private static String formatStageLabel(PilotStage stage) {
        if (stage == null) return "Proposal";
        return switch (stage) {
            case PROPOSAL -> "Proposal Stage";
            case FEASIBILITY -> "Feasibility Study";
            case PROTOTYPING -> "Lab Prototyping";
            case LAB_TESTING -> "Lab Testing & Validation";
            case FIELD_TRIAL -> "Field Pilot Deployment";
            case DEPLOYED -> "Fully Deployed & Handed Over";
        };
    }

    private static String formatStatusLabel(PilotStatus status) {
        if (status == null) return "Active";
        return switch (status) {
            case PROPOSED -> "Proposal Submitted";
            case UNDER_REVIEW -> "Under Review";
            case ACTIVE -> "Active & In Progress";
            case MILESTONE_PENDING -> "Milestone Approval Pending";
            case COMPLETED -> "Project Completed";
            case ON_HOLD -> "On Hold";
        };
    }

    private static String formatHealthStatusLabel(PilotHealthStatus health) {
        if (health == null) return "On Track";
        return switch (health) {
            case ON_TRACK -> "On Track";
            case DELAYED -> "Delayed";
            case AT_RISK -> "At Risk";
            case COMPLETED -> "Completed";
        };
    }

    private static String formatCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return "₹0";
        double val = amount.doubleValue();
        if (val >= 10000000) {
            return String.format("₹%.2f Cr", val / 10000000);
        } else if (val >= 100000) {
            return String.format("₹%.1f Lakhs", val / 100000);
        } else if (val >= 1000) {
            return String.format("₹%.1f K", val / 1000);
        }
        return "₹" + amount.toPlainString();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId != null ? projectId : id; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractDescription() { return abstractDescription; }
    public void setAbstractDescription(String abstractDescription) { this.abstractDescription = abstractDescription; }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public String getSectorName() { return sectorName; }
    public void setSectorName(String sectorName) { this.sectorName = sectorName; }

    public Long getUniversityId() { return universityId; }
    public void setUniversityId(Long universityId) { this.universityId = universityId; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getFacultyLeadName() { return facultyLeadName; }
    public void setFacultyLeadName(String facultyLeadName) { this.facultyLeadName = facultyLeadName; }

    public String getStudentLeadName() { return studentLeadName; }
    public void setStudentLeadName(String studentLeadName) { this.studentLeadName = studentLeadName; }

    public String getCorporateMentorName() { return corporateMentorName; }
    public void setCorporateMentorName(String corporateMentorName) { this.corporateMentorName = corporateMentorName; }

    public String getTargetDistrict() { return targetDistrict; }
    public void setTargetDistrict(String targetDistrict) { this.targetDistrict = targetDistrict; }

    public PilotStage getStage() { return stage; }
    public void setStage(PilotStage stage) { this.stage = stage; }

    public String getStageLabel() { return stageLabel; }
    public void setStageLabel(String stageLabel) { this.stageLabel = stageLabel; }

    public PilotStatus getStatus() { return status; }
    public void setStatus(PilotStatus status) { this.status = status; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public PilotHealthStatus getHealthStatus() { return healthStatus; }
    public void setHealthStatus(PilotHealthStatus healthStatus) { this.healthStatus = healthStatus; }

    public String getHealthStatusLabel() { return healthStatusLabel; }
    public void setHealthStatusLabel(String healthStatusLabel) { this.healthStatusLabel = healthStatusLabel; }

    public Integer getCurrentMilestone() { return currentMilestone; }
    public void setCurrentMilestone(Integer currentMilestone) { this.currentMilestone = currentMilestone; }

    public Integer getTotalMilestones() { return totalMilestones; }
    public void setTotalMilestones(Integer totalMilestones) { this.totalMilestones = totalMilestones; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public BigDecimal getTotalBudget() { return totalBudget; }
    public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }

    public String getTotalBudgetFormatted() { return totalBudgetFormatted; }
    public void setTotalBudgetFormatted(String totalBudgetFormatted) { this.totalBudgetFormatted = totalBudgetFormatted; }

    public BigDecimal getDisbursedBudget() { return disbursedBudget; }
    public void setDisbursedBudget(BigDecimal disbursedBudget) { this.disbursedBudget = disbursedBudget; }

    public String getDisbursedBudgetFormatted() { return disbursedBudgetFormatted; }
    public void setDisbursedBudgetFormatted(String disbursedBudgetFormatted) { this.disbursedBudgetFormatted = disbursedBudgetFormatted; }

    public Double getDisbursedPercentage() { return disbursedPercentage; }
    public void setDisbursedPercentage(Double disbursedPercentage) { this.disbursedPercentage = disbursedPercentage; }

    public LocalDate getNextDeliverableDate() { return nextDeliverableDate; }
    public void setNextDeliverableDate(LocalDate nextDeliverableDate) { this.nextDeliverableDate = nextDeliverableDate; }

    public LocalDate getTargetCompletionDate() { return targetCompletionDate; }
    public void setTargetCompletionDate(LocalDate targetCompletionDate) { this.targetCompletionDate = targetCompletionDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
