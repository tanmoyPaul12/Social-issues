package com.example.social_issues.projectlifecycle.dto;

import com.example.social_issues.projectlifecycle.model.ProjectTestResult;
import com.example.social_issues.projectlifecycle.model.TestPassStatus;
import com.example.social_issues.projectlifecycle.model.TestType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TestResultDto {

    private Long id;
    private Long projectId;
    private String testTitle;
    private TestType testType;
    private Integer trlLevel;
    private String testLocation;
    private LocalDate testDate;
    private String testedBy;
    private Long testedByUserId;
    private String parametersJson;
    private TestPassStatus passStatus;
    private String observations;
    private String evidenceAttachmentUrl;
    private String evidenceStorageKey;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TestResultDto() {}

    public static TestResultDto fromEntity(ProjectTestResult entity) {
        if (entity == null) return null;
        TestResultDto dto = new TestResultDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setTestTitle(entity.getTestTitle());
        dto.setTestType(entity.getTestType());
        dto.setTrlLevel(entity.getTrlLevel());
        dto.setTestLocation(entity.getTestLocation());
        dto.setTestDate(entity.getTestDate());
        dto.setTestedBy(entity.getTestedBy());
        dto.setTestedByUserId(entity.getTestedByUserId());
        dto.setParametersJson(entity.getParametersJson());
        dto.setPassStatus(entity.getPassStatus());
        dto.setObservations(entity.getObservations());
        dto.setEvidenceAttachmentUrl(entity.getEvidenceAttachmentUrl());
        dto.setEvidenceStorageKey(entity.getEvidenceStorageKey());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

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

    public Long getTestedByUserId() { return testedByUserId; }
    public void setTestedByUserId(Long testedByUserId) { this.testedByUserId = testedByUserId; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
