package com.example.social_issues.projectlifecycle.service.impl;

import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.projectlifecycle.dto.RecordTestResultRequest;
import com.example.social_issues.projectlifecycle.dto.TestResultDto;
import com.example.social_issues.projectlifecycle.model.ProjectTestResult;
import com.example.social_issues.projectlifecycle.model.TestPassStatus;
import com.example.social_issues.projectlifecycle.model.TestType;
import com.example.social_issues.projectlifecycle.repository.ProjectTestResultRepository;
import com.example.social_issues.projectlifecycle.service.ProjectTestingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProjectTestingServiceImpl implements ProjectTestingService {

    private static final Logger log = LoggerFactory.getLogger(ProjectTestingServiceImpl.class);

    private final ProjectTestResultRepository testResultRepository;

    public ProjectTestingServiceImpl(ProjectTestResultRepository testResultRepository) {
        this.testResultRepository = testResultRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultDto> getTestResultsByProject(Long projectId) {
        return testResultRepository.findByProjectIdOrderByTestDateDesc(projectId).stream()
                .map(TestResultDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TestResultDto getTestResultById(Long id) {
        ProjectTestResult testResult = testResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test result not found with id: " + id));
        return TestResultDto.fromEntity(testResult);
    }

    @Override
    @Transactional
    public TestResultDto recordTestResult(Long projectId, RecordTestResultRequest request, Long testerUserId) {
        ProjectTestResult testResult = new ProjectTestResult();
        testResult.setProjectId(projectId);
        testResult.setTestTitle(request.getTestTitle());
        testResult.setTestType(request.getTestType() != null ? request.getTestType() : TestType.LAB_BENCHMARK);
        testResult.setTrlLevel(request.getTrlLevel() != null ? request.getTrlLevel() : 4);
        testResult.setTestLocation(request.getTestLocation());
        testResult.setTestDate(request.getTestDate() != null ? request.getTestDate() : LocalDate.now());
        testResult.setTestedBy(request.getTestedBy());
        testResult.setTestedByUserId(testerUserId);
        testResult.setParametersJson(request.getParametersJson());
        testResult.setPassStatus(request.getPassStatus() != null ? request.getPassStatus() : TestPassStatus.UNDER_EVALUATION);
        testResult.setObservations(request.getObservations());
        testResult.setEvidenceAttachmentUrl(request.getEvidenceAttachmentUrl());
        testResult.setEvidenceStorageKey(request.getEvidenceStorageKey());

        ProjectTestResult saved = testResultRepository.save(testResult);
        log.info("Recorded Test Result '{}' (TRL {}) for project id: {}", saved.getTestTitle(), saved.getTrlLevel(), projectId);
        return TestResultDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getProjectHighestTrl(Long projectId) {
        return testResultRepository.findMaxVerifiedTrlLevel(projectId).orElse(1);
    }

    @Override
    @Transactional
    public void deleteTestResult(Long id) {
        ProjectTestResult testResult = testResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test result not found with id: " + id));
        testResultRepository.delete(testResult);
        log.info("Deleted Test Result id: {}", id);
    }
}
