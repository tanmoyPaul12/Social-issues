package com.example.social_issues.analytics.service.impl;

import com.example.social_issues.analytics.dto.AnalyticsDashboardResponse;
import com.example.social_issues.analytics.service.AnalyticsService;
import com.example.social_issues.problemsubmission.model.IssueStatus;
import com.example.social_issues.problemsubmission.repository.GrassrootIssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final GrassrootIssueRepository issueRepository;

    public AnalyticsServiceImpl(GrassrootIssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDashboardResponse getDashboardAnalytics() {
        AnalyticsDashboardResponse response = new AnalyticsDashboardResponse();

        long totalIssues = issueRepository.count();
        response.setTotalIssues(totalIssues);

        // Status Distribution for all 9 statuses
        Map<String, Long> statusMap = new LinkedHashMap<>();
        long resolvedCount = 0;
        long escalatedCount = 0;

        for (IssueStatus status : IssueStatus.values()) {
            long count = issueRepository.countByStatus(status);
            statusMap.put(status.name(), count);
            if (status == IssueStatus.RESOLVED) {
                resolvedCount = count;
            } else if (status == IssueStatus.ESCALATED) {
                escalatedCount = count;
            }
        }
        response.setStatusDistribution(statusMap);

        // Sector Breakdown
        Map<String, Long> sectorMap = new LinkedHashMap<>();
        List<Object[]> sectorRows = issueRepository.countGroupBySector();
        if (sectorRows != null) {
            for (Object[] row : sectorRows) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    sectorMap.put(row[0].toString(), ((Number) row[1]).longValue());
                }
            }
        }
        response.setSectorBreakdown(sectorMap);

        // District Breakdown
        Map<String, Long> districtMap = new LinkedHashMap<>();
        List<Object[]> districtRows = issueRepository.countGroupByDistrict();
        if (districtRows != null) {
            for (Object[] row : districtRows) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    districtMap.put(row[0].toString(), ((Number) row[1]).longValue());
                }
            }
        }
        response.setDistrictBreakdown(districtMap);

        // Priority Breakdown
        Map<String, Long> priorityMap = new LinkedHashMap<>();
        List<Object[]> priorityRows = issueRepository.countGroupByPriority();
        if (priorityRows != null) {
            for (Object[] row : priorityRows) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    priorityMap.put(row[0].toString(), ((Number) row[1]).longValue());
                }
            }
        }
        response.setPriorityBreakdown(priorityMap);

        // Monthly Trend
        Map<String, Long> monthlyMap = new LinkedHashMap<>();
        List<Object[]> monthlyRows = issueRepository.countGroupByMonth();
        if (monthlyRows != null) {
            for (Object[] row : monthlyRows) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    monthlyMap.put(row[0].toString(), ((Number) row[1]).longValue());
                }
            }
        }
        response.setMonthlyTrend(monthlyMap);

        // Calculation of rates (percentage rounded to 2 decimal places)
        if (totalIssues > 0) {
            double resRate = ((double) resolvedCount / totalIssues) * 100.0;
            double escRate = ((double) escalatedCount / totalIssues) * 100.0;
            response.setResolutionRate(Math.round(resRate * 100.0) / 100.0);
            response.setEscalationRate(Math.round(escRate * 100.0) / 100.0);
        } else {
            response.setResolutionRate(0.0);
            response.setEscalationRate(0.0);
        }

        return response;
    }
}
