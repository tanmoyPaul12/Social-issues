package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.TestPassStatus;
import com.example.social_issues.projectlifecycle.model.TestType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class RecordTestResultRequest {

    @NotBlank(message = "Test title is required")
    private String testTitle;

    @NotNull(message = "Test type is required")
    private TestType testType = TestType.LAB_BENCHMARK;

    @NotNull(message = "TRL level is required")
    @Min(value = 1, message = "TRL must be at least 1")
    @Max(value = 9, message = "TRL cannot exceed 9")
    private Integer trlLevel = 4;

    private String testLocation;
    private LocalDate testDate = LocalDate.now();
    private String testedBy;
    private String parametersJson;

    @NotNull(message = "Pass status is required")
    private TestPassStatus passStatus = TestPassStatus.UNDER_EVALUATION;

    private String observations;
    private String evidenceAttachmentUrl;
    private String evidenceStorageKey;

    public RecordTestResultRequest() {}

    public String getTestTitle() { return testTitle; }
    public void setTestTitle(String testTitle) { this.testTitle = testTitle; }

    public TestType getTestType() { return testType; }
    public void setTestType(TestType testType) { this.testType = testType; }

    public Integer getTrlLevel() { return trlLevel; }
    public void setTrlLevel(Integer trlLevel) { this.trlLevel = trlLevel; }

    public String getTestLocation() { return testLocation; }
    public void setTestLocation(String testLocation) { this.testLocation = testLocation; }

    public LocalDate getTestDate() { return testDate; }
    public void setTestDate(LocalDate testDate) { this.testDate = testDate; }

    public String getTestedBy() { return testedBy; }
    public void setTestedBy(String testedBy) { this.testedBy = testedBy; }

    public String getParametersJson() { return parametersJson; }
    public void setParametersJson(String parametersJson) { this.parametersJson = parametersJson; }

    public TestPassStatus getPassStatus() { return passStatus; }
    public void setPassStatus(TestPassStatus passStatus) { this.passStatus = passStatus; }

    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }

    public String getEvidenceAttachmentUrl() { return evidenceAttachmentUrl; }
    public void setEvidenceAttachmentUrl(String evidenceAttachmentUrl) { this.evidenceAttachmentUrl = evidenceAttachmentUrl; }

    public String getEvidenceStorageKey() { return evidenceStorageKey; }
    public void setEvidenceStorageKey(String evidenceStorageKey) { this.evidenceStorageKey = evidenceStorageKey; }
}
