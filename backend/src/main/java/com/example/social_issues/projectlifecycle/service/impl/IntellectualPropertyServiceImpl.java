package com.example.social_issues.projectlifecycle.service.impl;

import com.example.social_issues.common.exception.ResourceNotFoundException;
import com.example.social_issues.projectlifecycle.dto.CreateIpRecordRequest;
import com.example.social_issues.projectlifecycle.dto.IpRecordDto;
import com.example.social_issues.projectlifecycle.dto.UpdateIpStatusRequest;
import com.example.social_issues.projectlifecycle.model.IntellectualPropertyRecord;
import com.example.social_issues.projectlifecycle.model.IpStatus;
import com.example.social_issues.projectlifecycle.model.IpType;
import com.example.social_issues.projectlifecycle.repository.IntellectualPropertyRepository;
import com.example.social_issues.projectlifecycle.service.IntellectualPropertyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IntellectualPropertyServiceImpl implements IntellectualPropertyService {

    private static final Logger log = LoggerFactory.getLogger(IntellectualPropertyServiceImpl.class);

    private final IntellectualPropertyRepository ipRepository;

    public IntellectualPropertyServiceImpl(IntellectualPropertyRepository ipRepository) {
        this.ipRepository = ipRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IpRecordDto> getIpRecordsByProject(Long projectId) {
        return ipRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(IpRecordDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public IpRecordDto getIpRecordById(Long id) {
        IntellectualPropertyRecord record = ipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IP Record not found with id: " + id));
        return IpRecordDto.fromEntity(record);
    }

    @Override
    @Transactional
    public IpRecordDto createIpRecord(Long projectId, CreateIpRecordRequest request, Long submitterId) {
        IntellectualPropertyRecord record = new IntellectualPropertyRecord();
        record.setProjectId(projectId);
        record.setTitle(request.getTitle());
        record.setAbstractDescription(request.getAbstractDescription());
        record.setIpType(request.getIpType() != null ? request.getIpType() : IpType.SHARED_PATENT);
        record.setPatentApplicationNumber(request.getPatentApplicationNumber());
        record.setFilingDate(request.getFilingDate());
        record.setPatentOffice(request.getPatentOffice() != null ? request.getPatentOffice() : "Indian Patent Office (IPO) Kolkata");
        record.setStatus(request.getStatus() != null ? request.getStatus() : IpStatus.IDEA_DISCLOSURE);

        // Tripartite ownership percentage setup
        int hei = request.getHeiOwnershipShare() != null ? request.getHeiOwnershipShare() : 50;
        int student = request.getStudentInnovatorsShare() != null ? request.getStudentInnovatorsShare() : 30;
        int industry = request.getIndustryPartnerShare() != null ? request.getIndustryPartnerShare() : 20;
        record.setHeiOwnershipShare(hei);
        record.setStudentInnovatorsShare(student);
        record.setIndustryPartnerShare(industry);

        record.setInventorsList(request.getInventorsList());
        record.setCommercialPartnerName(request.getCommercialPartnerName());
        record.setMouDocumentUrl(request.getMouDocumentUrl());
        record.setMouDocumentStorageKey(request.getMouDocumentStorageKey());
        record.setRoyaltyTerms(request.getRoyaltyTerms());
        record.setSubmittedByUserId(submitterId);

        IntellectualPropertyRecord saved = ipRepository.save(record);
        log.info("Created IP Record '{}' (id: {}) for project id: {}", saved.getTitle(), saved.getId(), projectId);
        return IpRecordDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public IpRecordDto updateIpStatus(Long id, UpdateIpStatusRequest request) {
        IntellectualPropertyRecord record = ipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IP Record not found with id: " + id));

        record.setStatus(request.getStatus());

        if (request.getPatentApplicationNumber() != null && !request.getPatentApplicationNumber().isBlank()) {
            record.setPatentApplicationNumber(request.getPatentApplicationNumber().trim());
        }
        if (request.getFilingDate() != null) {
            record.setFilingDate(request.getFilingDate());
        }
        if (request.getGrantDate() != null) {
            record.setGrantDate(request.getGrantDate());
        }
        if (request.getPatentOffice() != null && !request.getPatentOffice().isBlank()) {
            record.setPatentOffice(request.getPatentOffice().trim());
        }
        if (request.getCommercialPartnerName() != null && !request.getCommercialPartnerName().isBlank()) {
            record.setCommercialPartnerName(request.getCommercialPartnerName().trim());
        }
        if (request.getRoyaltyTerms() != null && !request.getRoyaltyTerms().isBlank()) {
            record.setRoyaltyTerms(request.getRoyaltyTerms().trim());
        }
        if (request.getMouDocumentUrl() != null && !request.getMouDocumentUrl().isBlank()) {
            record.setMouDocumentUrl(request.getMouDocumentUrl().trim());
        }

        IntellectualPropertyRecord updated = ipRepository.save(record);
        log.info("Updated IP Record id: {} -> status: {}", id, updated.getStatus());
        return IpRecordDto.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IpRecordDto> getPlatformIpCatalog(IpType ipType, IpStatus status) {
        return ipRepository.findWithFilters(ipType, status).stream()
                .map(IpRecordDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void deleteIpRecord(Long id) {
        IntellectualPropertyRecord record = ipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IP Record not found with id: " + id));
        ipRepository.delete(record);
        log.info("Deleted IP Record id: {}", id);
    }
}
