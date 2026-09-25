package com.example.social_issues.analytics.service;

import com.example.social_issues.analytics.dto.DistrictReportFilterRequest;
import com.example.social_issues.analytics.dto.DistrictReportSummaryResponse;
import com.example.social_issues.analytics.dto.ReportPeriodOptionsDto;

public interface DistrictReportService {

    DistrictReportSummaryResponse getDistrictReportSummary(DistrictReportFilterRequest filter);

    byte[] generateDistrictReportCsv(DistrictReportFilterRequest filter);

    String generateCsvFilename(DistrictReportFilterRequest filter);

    ReportPeriodOptionsDto getReportPeriodOptions();
}
