package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.industrypartnership.dto.CoDevelopmentAgreementDto;
import com.example.social_issues.industrypartnership.dto.CreateAgreementRequest;
import com.example.social_issues.industrypartnership.model.AgreementStatus;
import com.example.social_issues.industrypartnership.model.CoDevelopmentAgreement;
import com.example.social_issues.industrypartnership.model.CoFundedPilot;
import com.example.social_issues.industrypartnership.repository.CoDevelopmentAgreementRepository;
import com.example.social_issues.industrypartnership.repository.CoFundedPilotRepository;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import com.example.social_issues.problemsubmission.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CoDevelopmentServiceImpl implements CoDevelopmentService {

    private static final Logger log = LoggerFactory.getLogger(CoDevelopmentServiceImpl.class);

    private final CoDevelopmentAgreementRepository agreementRepository;
    private final IndustryProfileRepository industryProfileRepository;
    private final CoFundedPilotRepository pilotRepository;
    private final FileStorageService fileStorageService;
    private final NotificationEventPublisher eventPublisher;

    public CoDevelopmentServiceImpl(
            CoDevelopmentAgreementRepository agreementRepository,
            IndustryProfileRepository industryProfileRepository,
            CoFundedPilotRepository pilotRepository,
            FileStorageService fileStorageService,
            NotificationEventPublisher eventPublisher
    ) {
        this.agreementRepository = agreementRepository;
        this.industryProfileRepository = industryProfileRepository;
        this.pilotRepository = pilotRepository;
        this.fileStorageService = fileStorageService;
        this.eventPublisher = eventPublisher;
    }

    private IndustryProfile resolveProfile(Long userId) {
        if (userId != null) {
            Optional<IndustryProfile> opt = industryProfileRepository.findByUserId(userId);
            if (opt.isPresent()) return opt.get();
        }
        return industryProfileRepository.findAll().stream().findFirst().orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoDevelopmentAgreementDto> getAgreements(Long userId, AgreementStatus status) {
        IndustryProfile profile = resolveProfile(userId);
        if (profile == null) {
            return Collections.emptyList();
        }

        List<CoDevelopmentAgreement> list = (status != null)
                ? agreementRepository.findByIndustryProfileIdAndStatus(profile.getId(), status)
                : agreementRepository.findByIndustryProfileId(profile.getId());

        return list.stream()
                .map(CoDevelopmentAgreementDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CoDevelopmentAgreementDto getAgreementDetail(Long userId, Long agreementId) {
        IndustryProfile profile = resolveProfile(userId);
        CoDevelopmentAgreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found with ID: " + agreementId));

        if (profile != null && !agreement.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to agreement");
        }

        return CoDevelopmentAgreementDto.fromEntity(agreement);
    }

    @Override
    @Transactional
    public CoDevelopmentAgreementDto createDraft(Long userId, CreateAgreementRequest request) {
        IndustryProfile profile = resolveProfile(userId);
        if (profile == null) {
            throw new IllegalStateException("Industry profile not found for user: " + userId);
        }

        CoDevelopmentAgreement agreement = new CoDevelopmentAgreement();
        agreement.setIndustryProfile(profile);

        if (request.getPilotId() != null) {
            Optional<CoFundedPilot> pilotOpt = pilotRepository.findById(request.getPilotId());
            pilotOpt.ifPresent(agreement::setPilot);
        }

        agreement.setUniversityId(request.getUniversityId());
        agreement.setUniversityName(request.getUniversityName() != null ? request.getUniversityName() : "Partner Academic Institution");
        agreement.setAgreementTitle(request.getAgreementTitle());
        if (request.getAgreementType() != null) {
            agreement.setAgreementType(request.getAgreementType());
        }
        agreement.setStatus(AgreementStatus.DRAFT);
        agreement.setIpSplitPercentIndustry(request.getIpSplitPercentIndustry() != null ? request.getIpSplitPercentIndustry() : 50.0);
        agreement.setIpSplitPercentUniversity(request.getIpSplitPercentUniversity() != null ? request.getIpSplitPercentUniversity() : 50.0);
        agreement.setScopeDescription(request.getScopeDescription());
        agreement.setSignatoryIndustryName(request.getSignatoryIndustryName() != null ? request.getSignatoryIndustryName() : (profile != null ? profile.getSpocName() : null));
        agreement.setSignatoryUniversityName(request.getSignatoryUniversityName());
        agreement.setExpiresAt(request.getExpiresAt());

        agreement = agreementRepository.save(agreement);

        return CoDevelopmentAgreementDto.fromEntity(agreement);
    }

    @Override
    @Transactional
    public CoDevelopmentAgreementDto uploadSignedCopy(Long userId, Long agreementId, MultipartFile file) {
        IndustryProfile profile = resolveProfile(userId);
        CoDevelopmentAgreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found with ID: " + agreementId));

        if (profile != null && !agreement.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to agreement");
        }

        if (file != null && !file.isEmpty()) {
            FileStorageService.StoredFile stored = fileStorageService.storeFile(file, "industry/agreements");
            agreement.setDocumentUrl(stored.fileUrl());
            agreement.setDocumentFileName(stored.originalFileName());
            agreement.setStatus(AgreementStatus.SIGNED_BY_INDUSTRY);
            agreement.setSignedAt(LocalDateTime.now());
        }

        agreement = agreementRepository.save(agreement);

        // Publish event to University team
        try {
            NotificationEvent event = new NotificationEvent();
            event.setEventType("AGREEMENT_SIGNED_BY_INDUSTRY");
            event.setTitle("Co-Development Agreement Signed");
            event.setMessage((profile != null ? profile.getCompanyName() : "Industry Partner") + " signed the agreement: '" + agreement.getAgreementTitle() + "'");
            event.setRecipientUserType("UNIVERSITY");
            event.setReferenceEntityType("AGREEMENT");
            event.setReferenceEntityId(agreement.getId());
            eventPublisher.publishIndustryNotification(event);
        } catch (Exception ex) {
            log.warn("Failed to publish agreement signed event: {}", ex.getMessage());
        }

        return CoDevelopmentAgreementDto.fromEntity(agreement);
    }

    @Override
    @Transactional
    public CoDevelopmentAgreementDto updateStatus(Long userId, Long agreementId, AgreementStatus status) {
        IndustryProfile profile = resolveProfile(userId);
        CoDevelopmentAgreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found with ID: " + agreementId));

        if (profile != null && !agreement.getIndustryProfile().getId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized access to agreement");
        }

        agreement.setStatus(status);
        if (status == AgreementStatus.FULLY_EXECUTED && agreement.getSignedAt() == null) {
            agreement.setSignedAt(LocalDateTime.now());
        }

        agreement = agreementRepository.save(agreement);

        return CoDevelopmentAgreementDto.fromEntity(agreement);
    }
}
