package com.example.social_issues.projectlifecycle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateMilestoneRequest {

    @NotNull(message = "Milestone number is required")
    private Integer milestoneNumber;

    @NotBlank(message = "Milestone title is required")
    private String title;

    private String deliverableSummary;

    private LocalDate targetDate;

    private BigDecimal trancheAmount;

    public CreateMilestoneRequest() {}

    public Integer getMilestoneNumber() { return milestoneNumber; }
    public void setMilestoneNumber(Integer milestoneNumber) { this.milestoneNumber = milestoneNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDeliverableSummary() { return deliverableSummary; }
    public void setDeliverableSummary(String deliverableSummary) { this.deliverableSummary = deliverableSummary; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public BigDecimal getTrancheAmount() { return trancheAmount; }
    public void setTrancheAmount(BigDecimal trancheAmount) { this.trancheAmount = trancheAmount; }
}
