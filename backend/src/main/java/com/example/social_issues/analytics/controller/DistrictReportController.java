package com.example.social_issues.analytics.controller;

import com.example.social_issues.analytics.dto.DistrictReportFilterRequest;
import com.example.social_issues.analytics.dto.DistrictReportSummaryResponse;
import com.example.social_issues.analytics.dto.ReportPeriodOptionsDto;
import com.example.social_issues.analytics.service.DistrictReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports/district")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowCredentials = "true")
public class DistrictReportController {

    private final DistrictReportService reportService;

    public DistrictReportController(DistrictReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Get dynamic reporting periods (Financial Years, Quarters, Half-Years, Months).
     */
    @GetMapping("/periods")
    public ResponseEntity<ReportPeriodOptionsDto> getReportPeriodOptions() {
        return ResponseEntity.ok(reportService.getReportPeriodOptions());
    }

    /**
     * Get district-wise innovation and grievance resolution report summary for live preview.
     */
    @GetMapping("/preview")
    public ResponseEntity<DistrictReportSummaryResponse> getDistrictReportPreview(
            @ModelAttribute DistrictReportFilterRequest filter
    ) {
        DistrictReportSummaryResponse summary = reportService.getDistrictReportSummary(filter);
        return ResponseEntity.ok(summary);
    }

    /**
     * Export streaming RFC 4180 CSV report for the selected temporal period and district scope.
     */
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportDistrictReportCsv(
            @ModelAttribute DistrictReportFilterRequest filter
    ) {
        byte[] csvBytes = reportService.generateDistrictReportCsv(filter);
        String filename = reportService.generateCsvFilename(filter);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .contentLength(csvBytes.length)
                .body(csvBytes);
    }
}
