package com.example.social_issues.analytics.dto;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

public class DistrictReportFilterRequest {

    private ReportPeriodType periodType = ReportPeriodType.FINANCIAL_YEAR;
    private String financialYear; // e.g. "2026-27"
    private String quarter;       // "Q1", "Q2", "Q3", "Q4"
    private String halfYear;      // "H1", "H2"
    private Integer year;         // e.g. 2026
    private Integer month;        // 1 to 12

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;  // For CUSTOM

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;    // For CUSTOM

    private String district = "ALL";
    private String sector = "ALL";
    private ReportType reportType = ReportType.DISTRICT_SUMMARY;

    public DistrictReportFilterRequest() {}

    public ReportPeriodType getPeriodType() {
        return periodType;
    }

    public void setPeriodType(ReportPeriodType periodType) {
        this.periodType = periodType;
    }

    public String getFinancialYear() {
        return financialYear;
    }

    public void setFinancialYear(String financialYear) {
        this.financialYear = financialYear;
    }

    public String getQuarter() {
        return quarter;
    }

    public void setQuarter(String quarter) {
        this.quarter = quarter;
    }

    public String getHalfYear() {
        return halfYear;
    }

    public void setHalfYear(String halfYear) {
        this.halfYear = halfYear;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
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

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }
}
