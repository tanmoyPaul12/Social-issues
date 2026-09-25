package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.universitycollab.dto.UniversityProjectResponse;
import java.util.ArrayList;
import java.util.List;

public class ProjectLifecycleDossierDto {

    private UniversityProjectResponse project;
    private List<MilestoneDto> milestones = new ArrayList<>();
    private List<TestResultDto> testResults = new ArrayList<>();
    private Integer highestTrl = 1;
    private List<ApprovalSignoffDto> signoffs = new ArrayList<>();
    private DualClosedLoopStatusDto closedLoopStatus;
    private List<IpRecordDto> ipRecords = new ArrayList<>();
    private long totalDeliverablesCount = 0;
    private long approvedDeliverablesCount = 0;
    private boolean isNodalSignoffPending = false;

    public ProjectLifecycleDossierDto() {}

    public UniversityProjectResponse getProject() {
        return project;
    }

    public void setProject(UniversityProjectResponse project) {
        this.project = project;
    }

    public List<MilestoneDto> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<MilestoneDto> milestones) {
        this.milestones = milestones;
    }

    public List<TestResultDto> getTestResults() {
        return testResults;
    }

    public void setTestResults(List<TestResultDto> testResults) {
        this.testResults = testResults;
    }

    public Integer getHighestTrl() {
        return highestTrl;
    }

    public void setHighestTrl(Integer highestTrl) {
        this.highestTrl = highestTrl;
    }

    public List<ApprovalSignoffDto> getSignoffs() {
        return signoffs;
    }

    public void setSignoffs(List<ApprovalSignoffDto> signoffs) {
        this.signoffs = signoffs;
    }

    public DualClosedLoopStatusDto getClosedLoopStatus() {
        return closedLoopStatus;
    }

    public void setClosedLoopStatus(DualClosedLoopStatusDto closedLoopStatus) {
        this.closedLoopStatus = closedLoopStatus;
    }

    public List<IpRecordDto> getIpRecords() {
        return ipRecords;
    }

    public void setIpRecords(List<IpRecordDto> ipRecords) {
        this.ipRecords = ipRecords;
    }

    public long getTotalDeliverablesCount() {
        return totalDeliverablesCount;
    }

    public void setTotalDeliverablesCount(long totalDeliverablesCount) {
        this.totalDeliverablesCount = totalDeliverablesCount;
    }

    public long getApprovedDeliverablesCount() {
        return approvedDeliverablesCount;
    }

    public void setApprovedDeliverablesCount(long approvedDeliverablesCount) {
        this.approvedDeliverablesCount = approvedDeliverablesCount;
    }

    public boolean isNodalSignoffPending() {
        return isNodalSignoffPending;
    }

    public void setNodalSignoffPending(boolean nodalSignoffPending) {
        isNodalSignoffPending = nodalSignoffPending;
    }
}
