package com.example.social_issues.projectlifecycle.service;

import com.example.social_issues.projectlifecycle.dto.CreateIpRecordRequest;
import com.example.social_issues.projectlifecycle.dto.IpRecordDto;
import com.example.social_issues.projectlifecycle.dto.UpdateIpStatusRequest;
import com.example.social_issues.projectlifecycle.model.IpStatus;
import com.example.social_issues.projectlifecycle.model.IpType;

import java.util.List;

public interface IntellectualPropertyService {

    List<IpRecordDto> getIpRecordsByProject(Long projectId);

    IpRecordDto getIpRecordById(Long id);

    IpRecordDto createIpRecord(Long projectId, CreateIpRecordRequest request, Long submitterId);

    IpRecordDto updateIpStatus(Long id, UpdateIpStatusRequest request);

    List<IpRecordDto> getPlatformIpCatalog(IpType ipType, IpStatus status);

    void deleteIpRecord(Long id);
}
