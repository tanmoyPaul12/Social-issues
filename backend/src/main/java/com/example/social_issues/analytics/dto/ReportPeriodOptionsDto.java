package com.example.social_issues.analytics.dto;

import java.util.ArrayList;
import java.util.List;

public class ReportPeriodOptionsDto {

    private List<String> availableFinancialYears = new ArrayList<>();
    private String currentFinancialYear;
    private String currentQuarter;
    private List<PeriodItemDto> quarters = new ArrayList<>();
    private List<PeriodItemDto> halfYears = new ArrayList<>();
    private List<PeriodItemDto> months = new ArrayList<>();
    private List<String> districts = new ArrayList<>();
    private List<String> domains = new ArrayList<>();

    public static class PeriodItemDto {
        private String id;
        private String label;

        public PeriodItemDto() {}

        public PeriodItemDto(String id, String label) {
            this.id = id;
            this.label = label;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }

    public ReportPeriodOptionsDto() {}

    public List<String> getAvailableFinancialYears() {
        return availableFinancialYears;
    }

    public void setAvailableFinancialYears(List<String> availableFinancialYears) {
        this.availableFinancialYears = availableFinancialYears;
    }

    public String getCurrentFinancialYear() {
        return currentFinancialYear;
    }

    public void setCurrentFinancialYear(String currentFinancialYear) {
        this.currentFinancialYear = currentFinancialYear;
    }

    public String getCurrentQuarter() {
        return currentQuarter;
    }

    public void setCurrentQuarter(String currentQuarter) {
        this.currentQuarter = currentQuarter;
    }

    public List<PeriodItemDto> getQuarters() {
        return quarters;
    }

    public void setQuarters(List<PeriodItemDto> quarters) {
        this.quarters = quarters;
    }

    public List<PeriodItemDto> getHalfYears() {
        return halfYears;
    }

    public void setHalfYears(List<PeriodItemDto> halfYears) {
        this.halfYears = halfYears;
    }

    public List<PeriodItemDto> getMonths() {
        return months;
    }

    public void setMonths(List<PeriodItemDto> months) {
        this.months = months;
    }

    public List<String> getDistricts() {
        return districts;
    }

    public void setDistricts(List<String> districts) {
        this.districts = districts;
    }

    public List<String> getDomains() {
        return domains;
    }

    public void setDomains(List<String> domains) {
        this.domains = domains;
    }
}
