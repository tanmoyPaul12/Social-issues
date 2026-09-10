package com.example.social_issues.analytics.dto;

import java.util.Map;

public class AnalyticsDashboardResponse {

    private long totalIssues;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> sectorBreakdown;
    private Map<String, Long> districtBreakdown;
    private Map<String, Long> priorityBreakdown;
    private Map<String, Long> monthlyTrend;
    private double resolutionRate;
    private double escalationRate;

    public AnalyticsDashboardResponse() {}

    public long getTotalIssues() {
        return totalIssues;
    }

    public void setTotalIssues(long totalIssues) {
        this.totalIssues = totalIssues;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public Map<String, Long> getSectorBreakdown() {
        return sectorBreakdown;
    }

    public void setSectorBreakdown(Map<String, Long> sectorBreakdown) {
        this.sectorBreakdown = sectorBreakdown;
    }

    public Map<String, Long> getDistrictBreakdown() {
        return districtBreakdown;
    }

    public void setDistrictBreakdown(Map<String, Long> districtBreakdown) {
        this.districtBreakdown = districtBreakdown;
    }

    public Map<String, Long> getPriorityBreakdown() {
        return priorityBreakdown;
    }

    public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) {
        this.priorityBreakdown = priorityBreakdown;
    }

    public Map<String, Long> getMonthlyTrend() {
        return monthlyTrend;
    }

    public void setMonthlyTrend(Map<String, Long> monthlyTrend) {
        this.monthlyTrend = monthlyTrend;
    }

    public double getResolutionRate() {
        return resolutionRate;
    }

    public void setResolutionRate(double resolutionRate) {
        this.resolutionRate = resolutionRate;
    }

    public double getEscalationRate() {
        return escalationRate;
    }

    public void setEscalationRate(double escalationRate) {
        this.escalationRate = escalationRate;
    }
}
