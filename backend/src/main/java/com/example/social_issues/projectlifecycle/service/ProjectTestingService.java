package com.example.social_issues.projectlifecycle.service;

import com.example.social_issues.projectlifecycle.dto.RecordTestResultRequest;
import com.example.social_issues.projectlifecycle.dto.TestResultDto;

import java.util.List;

public interface ProjectTestingService {

    List<TestResultDto> getTestResultsByProject(Long projectId);

    TestResultDto getTestResultById(Long id);

    TestResultDto recordTestResult(Long projectId, RecordTestResultRequest request, Long testerUserId);

    Integer getProjectHighestTrl(Long projectId);

    void deleteTestResult(Long id);
}
