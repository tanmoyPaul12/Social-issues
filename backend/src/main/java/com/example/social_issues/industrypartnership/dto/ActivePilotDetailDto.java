package com.example.social_issues.industrypartnership.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ActivePilotDetailDto {

    private ActivePilotSummaryDto project;
    private List<MilestoneDto> milestones = new ArrayList<>();
    private List<DisbursementDto> disbursements = new ArrayList<>();
    private List<DiscussionMessageDto> recentDiscussions = new ArrayList<>();
    private List<PilotDocumentDto> documents = new ArrayList<>();

    private int totalMilestonesCount;
    private int completedMilestonesCount;
    private int pendingReviewMilestonesCount;

    private BigDecimal totalCommittedGrant = BigDecimal.ZERO;
    private String totalCommittedFormatted;
    private BigDecimal totalDisbursedGrant = BigDecimal.ZERO;
    private String totalDisbursedFormatted;
    private BigDecimal remainingGrant = BigDecimal.ZERO;
    private String remainingFormatted;

    public ActivePilotDetailDto() {}

    public ActivePilotSummaryDto getProject() { return project; }
    public void setProject(ActivePilotSummaryDto project) { this.project = project; }

    public List<MilestoneDto> getMilestones() { return milestones; }
    public void setMilestones(List<MilestoneDto> milestones) { this.milestones = milestones; }

    public List<DisbursementDto> getDisbursements() { return disbursements; }
    public void setDisbursements(List<DisbursementDto> disbursements) { this.disbursements = disbursements; }

    public List<DiscussionMessageDto> getRecentDiscussions() { return recentDiscussions; }
    public void setRecentDiscussions(List<DiscussionMessageDto> recentDiscussions) { this.recentDiscussions = recentDiscussions; }

    public List<PilotDocumentDto> getDocuments() { return documents; }
    public void setDocuments(List<PilotDocumentDto> documents) { this.documents = documents; }

    public int getTotalMilestonesCount() { return totalMilestonesCount; }
    public void setTotalMilestonesCount(int totalMilestonesCount) { this.totalMilestonesCount = totalMilestonesCount; }

    public int getCompletedMilestonesCount() { return completedMilestonesCount; }
    public void setCompletedMilestonesCount(int completedMilestonesCount) { this.completedMilestonesCount = completedMilestonesCount; }

    public int getPendingReviewMilestonesCount() { return pendingReviewMilestonesCount; }
    public void setPendingReviewMilestonesCount(int pendingReviewMilestonesCount) { this.pendingReviewMilestonesCount = pendingReviewMilestonesCount; }

    public BigDecimal getTotalCommittedGrant() { return totalCommittedGrant; }
    public void setTotalCommittedGrant(BigDecimal totalCommittedGrant) { this.totalCommittedGrant = totalCommittedGrant; }

    public String getTotalCommittedFormatted() { return totalCommittedFormatted; }
    public void setTotalCommittedFormatted(String totalCommittedFormatted) { this.totalCommittedFormatted = totalCommittedFormatted; }

    public BigDecimal getTotalDisbursedGrant() { return totalDisbursedGrant; }
    public void setTotalDisbursedGrant(BigDecimal totalDisbursedGrant) { this.totalDisbursedGrant = totalDisbursedGrant; }

    public String getTotalDisbursedFormatted() { return totalDisbursedFormatted; }
    public void setTotalDisbursedFormatted(String totalDisbursedFormatted) { this.totalDisbursedFormatted = totalDisbursedFormatted; }

    public BigDecimal getRemainingGrant() { return remainingGrant; }
    public void setRemainingGrant(BigDecimal remainingGrant) { this.remainingGrant = remainingGrant; }

    public String getRemainingFormatted() { return remainingFormatted; }
    public void setRemainingFormatted(String remainingFormatted) { this.remainingFormatted = remainingFormatted; }
}
