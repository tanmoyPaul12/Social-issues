package com.example.social_issues.industrypartnership.dto;

public class QuickActionsDto {

    private int pendingApprovalsCount = 0;
    private int proposalsAwaitingReviewCount = 0;
    private int unreadAlertsCount = 0;

    public QuickActionsDto() {}

    public QuickActionsDto(int pendingApprovalsCount, int proposalsAwaitingReviewCount, int unreadAlertsCount) {
        this.pendingApprovalsCount = pendingApprovalsCount;
        this.proposalsAwaitingReviewCount = proposalsAwaitingReviewCount;
        this.unreadAlertsCount = unreadAlertsCount;
    }

    public int getPendingApprovalsCount() { return pendingApprovalsCount; }
    public void setPendingApprovalsCount(int pendingApprovalsCount) { this.pendingApprovalsCount = pendingApprovalsCount; }

    public int getProposalsAwaitingReviewCount() { return proposalsAwaitingReviewCount; }
    public void setProposalsAwaitingReviewCount(int proposalsAwaitingReviewCount) { this.proposalsAwaitingReviewCount = proposalsAwaitingReviewCount; }

    public int getUnreadAlertsCount() { return unreadAlertsCount; }
    public void setUnreadAlertsCount(int unreadAlertsCount) { this.unreadAlertsCount = unreadAlertsCount; }
}
