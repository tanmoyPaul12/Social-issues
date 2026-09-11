package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.industrypartnership.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FieldTestbedService {

    Page<TestbedSponsorshipDto> getTestbeds(
            Long userId,
            String district,
            String status,
            String search,
            int page,
            int size
    );

    TestbedSponsorshipDto getTestbedById(Long userId, Long testbedId);

    TestbedSponsorshipDto createTestbed(Long userId, CreateTestbedRequest request);

    TestbedSponsorshipDto updateStatus(Long userId, Long testbedId, UpdateTestbedStatusRequest request);

    TestbedSponsorshipDto uploadEvidence(Long userId, Long testbedId, List<MultipartFile> files);

    List<TestbedDistrictSummaryDto> getDistrictSummary(Long userId);

    void deleteTestbed(Long userId, Long testbedId);
}
