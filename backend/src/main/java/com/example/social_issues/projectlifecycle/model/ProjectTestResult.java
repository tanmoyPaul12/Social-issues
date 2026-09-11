package com.example.social_issues.projectlifecycle.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_test_results", indexes = {
    @Index(name = "idx_test_project_id", columnList = "project_id"),
    @Index(name = "idx_test_pass_status", columnList = "pass_status"),
    @Index(name = "idx_test_trl_level", columnList = "trl_level"),
    @Index(name = "idx_test_type", columnList = "test_type")
})
public class ProjectTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "test_title", nullable = false, length = 255)
    private String testTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_type", nullable = false, length = 50)
    private TestType testType = TestType.LAB_BENCHMARK;

    @Column(name = "trl_level", nullable = false)
    private Integer trlLevel = 4; // 1 to 9 scale

    @Column(name = "test_location", length = 200)
    private String testLocation;

    @Column(name = "test_date")
    private LocalDate testDate = LocalDate.now();

    @Column(name = "tested_by", length = 150)
    private String testedBy;

    @Column(name = "tested_by_user_id")
    private Long testedByUserId;

    @Column(name = "parameters_json", columnDefinition = "TEXT")
    private String parametersJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "pass_status", nullable = false, length = 50)
    private TestPassStatus passStatus = TestPassStatus.UNDER_EVALUATION;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "evidence_attachment_url", length = 500)
    private String evidenceAttachmentUrl;

    @Column(name = "evidence_storage_key", length = 255)
    private String evidenceStorageKey;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public ProjectTestResult() {}

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
