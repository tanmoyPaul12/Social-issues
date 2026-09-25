package com.example.social_issues.analytics.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class DistrictReportSummaryResponse {

    private String periodLabel;
    private ReportPeriodType periodType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String selectedDistrict;
    private String selectedSector;

    // Executive Totals
    private long totalGrievancesSubmitted;
    private long totalGrievancesTriaged;
    private long totalGrievancesAssignedHEI;
    private long totalGrievancesResolved;
    private double statewideResolutionRate;

    private long totalActiveProjects;
    private long totalCompletedProjects;
    private double overallAvgTrl;
    private int statewideHighestTrl;

    private long totalPatentsFiled;
    private long totalPatentsGranted;
    private BigDecimal totalCsrAllocatedInr = BigDecimal.ZERO;
    private long totalParticipatingUniversitiesCount;

    private List<DistrictReportRowDto> districtBreakdown = new ArrayList<>();

    public DistrictReportSummaryResponse() {}

    public String getPeriodLabel() {
        return periodLabel;
    }

    public void setPeriodLabel(String periodLabel) {
        this.periodLabel = periodLabel;
    }

    public ReportPeriodType getPeriodType() {
        return periodType;
    }

    public void setPeriodType(ReportPeriodType periodType) {
        this.periodType = periodType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getSelectedDistrict() {
        return selectedDistrict;
    }

    public void setSelectedDistrict(String selectedDistrict) {
        this.selectedDistrict = selectedDistrict;
    }

    public String getSelectedSector() {
        return selectedSector;
    }

    public void setSelectedSector(String selectedSector) {
        this.selectedSector = selectedSector;
    }

    public long getTotalGrievancesSubmitted() {
        return totalGrievancesSubmitted;
    }

    public void setTotalGrievancesSubmitted(long totalGrievancesSubmitted) {
        this.totalGrievancesSubmitted = totalGrievancesSubmitted;
    }

    public long getTotalGrievancesTriaged() {
        return totalGrievancesTriaged;
    }

    public void setTotalGrievancesTriaged(long totalGrievancesTriaged) {
        this.totalGrievancesTriaged = totalGrievancesTriaged;
    }

    public long getTotalGrievancesAssignedHEI() {
        return totalGrievancesAssignedHEI;
    }

    public void setTotalGrievancesAssignedHEI(long totalGrievancesAssignedHEI) {
        this.totalGrievancesAssignedHEI = totalGrievancesAssignedHEI;
    }

    public long getTotalGrievancesResolved() {
        return totalGrievancesResolved;
    }

    public void setTotalGrievancesResolved(long totalGrievancesResolved) {
        this.totalGrievancesResolved = totalGrievancesResolved;
    }

    public double getStatewideResolutionRate() {
        return statewideResolutionRate;
    }

    public void setStatewideResolutionRate(double statewideResolutionRate) {
        this.statewideResolutionRate = statewideResolutionRate;
    }

    public long getTotalActiveProjects() {
        return totalActiveProjects;
    }

    public void setTotalActiveProjects(long totalActiveProjects) {
        this.totalActiveProjects = totalActiveProjects;
    }

    public long getTotalCompletedProjects() {
        return totalCompletedProjects;
    }

    public void setTotalCompletedProjects(long totalCompletedProjects) {
        this.totalCompletedProjects = totalCompletedProjects;
    }

    public double getOverallAvgTrl() {
        return overallAvgTrl;
    }

    public void setOverallAvgTrl(double overallAvgTrl) {
        this.overallAvgTrl = overallAvgTrl;
    }

    public int getStatewideHighestTrl() {
        return statewideHighestTrl;
    }

    public void setStatewideHighestTrl(int statewideHighestTrl) {
        this.statewideHighestTrl = statewideHighestTrl;
    }

    public long getTotalPatentsFiled() {
        return totalPatentsFiled;
    }

    public void setTotalPatentsFiled(long totalPatentsFiled) {
        this.totalPatentsFiled = totalPatentsFiled;
    }

    public long getTotalPatentsGranted() {
        return totalPatentsGranted;
    }

    public void setTotalPatentsGranted(long totalPatentsGranted) {
        this.totalPatentsGranted = totalPatentsGranted;
    }

    public BigDecimal getTotalCsrAllocatedInr() {
        return totalCsrAllocatedInr;
    }

    public void setTotalCsrAllocatedInr(BigDecimal totalCsrAllocatedInr) {
        this.totalCsrAllocatedInr = totalCsrAllocatedInr;
    }

    public long getTotalParticipatingUniversitiesCount() {
        return totalParticipatingUniversitiesCount;
    }

    public void setTotalParticipatingUniversitiesCount(long totalParticipatingUniversitiesCount) {
        this.totalParticipatingUniversitiesCount = totalParticipatingUniversitiesCount;
    }

    public List<DistrictReportRowDto> getDistrictBreakdown() {
        return districtBreakdown;
    }

    public void setDistrictBreakdown(List<DistrictReportRowDto> districtBreakdown) {
        this.districtBreakdown = districtBreakdown;
    }
}
