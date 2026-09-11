package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.industrypartnership.dto.CoDevelopmentAgreementDto;
import com.example.social_issues.industrypartnership.dto.CreateAgreementRequest;
import com.example.social_issues.industrypartnership.model.AgreementStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CoDevelopmentService {

    List<CoDevelopmentAgreementDto> getAgreements(Long userId, AgreementStatus status);

    CoDevelopmentAgreementDto getAgreementDetail(Long userId, Long agreementId);

    CoDevelopmentAgreementDto createDraft(Long userId, CreateAgreementRequest request);

    CoDevelopmentAgreementDto uploadSignedCopy(Long userId, Long agreementId, MultipartFile file);

    CoDevelopmentAgreementDto updateStatus(Long userId, Long agreementId, AgreementStatus status);
}
