package com.example.social_issues.problemsubmission.dto;

import java.util.Map;

public class IssueStatsResponse {

    private long totalIssues;
    private long draftIssues;
    private long submittedIssues;
    private long underReviewIssues;
    private long triagedIssues;
    private long assignedHeiIssues;
    private long inProgressIssues;
    private long escalatedIssues;
    private long resolvedIssues;
    private long rejectedIssues;
    private Map<String, Long> sectorBreakdown;
    private Map<String, Long> districtBreakdown;

    public IssueStatsResponse() {}

    public long getTotalIssues() { return totalIssues; }
    public void setTotalIssues(long totalIssues) { this.totalIssues = totalIssues; }

    public long getDraftIssues() { return draftIssues; }
    public void setDraftIssues(long draftIssues) { this.draftIssues = draftIssues; }

    public long getSubmittedIssues() { return submittedIssues; }
    public void setSubmittedIssues(long submittedIssues) { this.submittedIssues = submittedIssues; }

    public long getUnderReviewIssues() { return underReviewIssues; }
    public void setUnderReviewIssues(long underReviewIssues) { this.underReviewIssues = underReviewIssues; }

    public long getTriagedIssues() { return triagedIssues; }
    public void setTriagedIssues(long triagedIssues) { this.triagedIssues = triagedIssues; }

    public long getAssignedHeiIssues() { return assignedHeiIssues; }
    public void setAssignedHeiIssues(long assignedHeiIssues) { this.assignedHeiIssues = assignedHeiIssues; }

    public long getInProgressIssues() { return inProgressIssues; }
    public void setInProgressIssues(long inProgressIssues) { this.inProgressIssues = inProgressIssues; }

    public long getEscalatedIssues() { return escalatedIssues; }
    public void setEscalatedIssues(long escalatedIssues) { this.escalatedIssues = escalatedIssues; }

    public long getResolvedIssues() { return resolvedIssues; }
    public void setResolvedIssues(long resolvedIssues) { this.resolvedIssues = resolvedIssues; }

    public long getRejectedIssues() { return rejectedIssues; }
    public void setRejectedIssues(long rejectedIssues) { this.rejectedIssues = rejectedIssues; }

    public Map<String, Long> getSectorBreakdown() { return sectorBreakdown; }
    public void setSectorBreakdown(Map<String, Long> sectorBreakdown) { this.sectorBreakdown = sectorBreakdown; }

    public Map<String, Long> getDistrictBreakdown() { return districtBreakdown; }
    public void setDistrictBreakdown(Map<String, Long> districtBreakdown) { this.districtBreakdown = districtBreakdown; }
}
