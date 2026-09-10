package com.example.social_issues.universitycollab.dto;

import com.example.social_issues.universitycollab.model.UniversityProjectStage;
import jakarta.validation.constraints.NotNull;

public class UpdateProjectStageRequest {

    @NotNull(message = "Stage is required")
    private UniversityProjectStage stage;

    private Integer progressPercentage;

    private String milestoneDesc;

    public UpdateProjectStageRequest() {}

    public UniversityProjectStage getStage() { return stage; }
    public void setStage(UniversityProjectStage stage) { this.stage = stage; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getMilestoneDesc() { return milestoneDesc; }
    public void setMilestoneDesc(String milestoneDesc) { this.milestoneDesc = milestoneDesc; }
}
