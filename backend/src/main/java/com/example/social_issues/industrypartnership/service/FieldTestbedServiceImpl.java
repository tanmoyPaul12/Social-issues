package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.*;
import com.example.social_issues.industrypartnership.repository.CoFundedPilotRepository;
import com.example.social_issues.industrypartnership.repository.TestbedSponsorshipRepository;
import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import com.example.social_issues.problemsubmission.service.FileStorageService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FieldTestbedServiceImpl implements FieldTestbedService {

    private static final Logger log = LoggerFactory.getLogger(FieldTestbedServiceImpl.class);

    private final TestbedSponsorshipRepository testbedRepository;
    private final IndustryProfileRepository industryProfileRepository;
    private final CoFundedPilotRepository pilotRepository;
    private final FileStorageService fileStorageService;
    private final NotificationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    public FieldTestbedServiceImpl(
            TestbedSponsorshipRepository testbedRepository,
            IndustryProfileRepository industryProfileRepository,
            CoFundedPilotRepository pilotRepository,
            FileStorageService fileStorageService,
            NotificationEventPublisher eventPublisher,
            ObjectMapper objectMapper
    ) {
        this.testbedRepository = testbedRepository;
        this.industryProfileRepository = industryProfileRepository;
        this.pilotRepository = pilotRepository;
        this.fileStorageService = fileStorageService;
        this.eventPublisher = eventPublisher;
        this.objectMapper = objectMapper;
    }

    private IndustryProfile resolveProfile(Long userId) {
        if (userId != null) {
            Optional<IndustryProfile> opt = industryProfileRepository.findByUserId(userId);
            if (opt.isPresent()) return opt.get();
        }
        List<IndustryProfile> list = industryProfileRepository.findAll();
        if (!list.isEmpty()) return list.get(0);
        throw new IllegalStateException("No registered industry profile found.");
    }

    @Override
    @Transactional
    public Page<TestbedSponsorshipDto> getTestbeds(
            Long userId,
            String district,
            String status,
            String search,
            int page,
            int size
    ) {
        IndustryProfile profile = resolveProfile(userId);
        List<TestbedSponsorship> all = testbedRepository.findByIndustryProfileIdOrderByCreatedAtDesc(profile.getId());

        // Auto-seed default testbeds if newly created corporate profile has none
        if (all.isEmpty()) {
            all = seedDefaultTestbeds(profile);
        }

        // Apply filters
        List<TestbedSponsorship> filtered = all.stream()
                .filter(t -> {
                    if (district != null && !district.isBlank() && !district.equalsIgnoreCase("ALL")) {
                        if (!t.getDistrict().equalsIgnoreCase(district)) return false;
                    }
                    if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                        String sName = t.getDeploymentStatus() != null ? t.getDeploymentStatus().name() : t.getStatus();
                        if (!sName.equalsIgnoreCase(status)) return false;
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        boolean matchesName = t.getTestbedName() != null && t.getTestbedName().toLowerCase().contains(q);
                        boolean matchesDist = t.getDistrict() != null && t.getDistrict().toLowerCase().contains(q);
                        boolean matchesProj = t.getProjectName() != null && t.getProjectName().toLowerCase().contains(q);
                        if (!matchesName && !matchesDist && !matchesProj) return false;
                    }
                    return true;
                })
                .toList();

        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        List<TestbedSponsorshipDto> dtoList = filtered.subList(start, end).stream()
                .map(TestbedSponsorshipDto::fromEntity)
                .toList();

        return new PageImpl<>(dtoList, PageRequest.of(page, Math.max(size, 1)), filtered.size());
    }

    @Override
    @Transactional(readOnly = true)
    public TestbedSponsorshipDto getTestbedById(Long userId, Long testbedId) {
        IndustryProfile profile = resolveProfile(userId);
        TestbedSponsorship testbed = testbedRepository.findByIdAndIndustryProfileId(testbedId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Field testbed deployment not found: " + testbedId));
        return TestbedSponsorshipDto.fromEntity(testbed);
    }

    @Override
    @Transactional
    public TestbedSponsorshipDto createTestbed(Long userId, CreateTestbedRequest request) {
        IndustryProfile profile = resolveProfile(userId);

        TestbedSponsorship testbed = new TestbedSponsorship();
        testbed.setIndustryProfile(profile);
        testbed.setTestbedName(request.getTestbedName().trim());
        testbed.setDistrict(request.getDistrict().trim());
        testbed.setBlock(request.getBlock() != null ? request.getBlock().trim() : null);
        testbed.setVillageOrLocation(request.getVillageOrLocation() != null ? request.getVillageOrLocation().trim() : null);

        if (request.getPilotId() != null) {
            pilotRepository.findById(request.getPilotId()).ifPresent(testbed::setPilot);
        }
        testbed.setProjectName(request.getProjectName());
        testbed.setPilotPhase(request.getPilotPhase() != null ? request.getPilotPhase() : "Phase 1 - Field Validation");

        Long beneficiaries = request.getBeneficiariesImpacted() != null ? request.getBeneficiariesImpacted()
                : (request.getBeneficiaryCount() != null ? request.getBeneficiaryCount().longValue() : 0L);
        testbed.setBeneficiariesImpacted(beneficiaries);
        testbed.setBeneficiaryCount(beneficiaries.intValue());

        testbed.setDeploymentStatus(request.getDeploymentStatus() != null ? request.getDeploymentStatus() : DeploymentStatus.PLANNED);
        testbed.setStatus(testbed.getDeploymentStatus().name());
        testbed.setLiveDataFeedUrl(request.getLiveDataFeedUrl());
        testbed.setStartedAt(request.getStartedAt() != null ? request.getStartedAt() : LocalDate.now());
        testbed.setCompletedAt(request.getCompletedAt());
        testbed.setCreatedAt(LocalDateTime.now());

        testbed = testbedRepository.save(testbed);

        publishTestbedEvent(
                "TESTBED_DEPLOYMENT_CREATED",
                "New Field Testbed Commissioned",
                "Testbed '" + testbed.getTestbedName() + "' registered in " + testbed.getDistrict() + " district.",
                testbed.getId()
        );

        return TestbedSponsorshipDto.fromEntity(testbed);
    }

    @Override
    @Transactional
    public TestbedSponsorshipDto updateStatus(Long userId, Long testbedId, UpdateTestbedStatusRequest request) {
        IndustryProfile profile = resolveProfile(userId);
        TestbedSponsorship testbed = testbedRepository.findByIdAndIndustryProfileId(testbedId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Field testbed deployment not found: " + testbedId));

        if (request.getStatus() != null) {
            testbed.setDeploymentStatus(request.getStatus());
            testbed.setStatus(request.getStatus().name());
        }

        if (request.getBeneficiariesImpacted() != null) {
            testbed.setBeneficiariesImpacted(request.getBeneficiariesImpacted());
            testbed.setBeneficiaryCount(request.getBeneficiariesImpacted().intValue());
        } else if (request.getBeneficiaryCount() != null) {
            testbed.setBeneficiaryCount(request.getBeneficiaryCount());
            testbed.setBeneficiariesImpacted(request.getBeneficiaryCount().longValue());
        }

        if (request.getLiveDataFeedUrl() != null) {
            testbed.setLiveDataFeedUrl(request.getLiveDataFeedUrl());
        }

        if (request.getCompletedAt() != null) {
            testbed.setCompletedAt(request.getCompletedAt());
        }

        testbed = testbedRepository.save(testbed);

        publishTestbedEvent(
                "TESTBED_STATUS_UPDATED",
                "Field Testbed Status Updated",
                "Deployment status for '" + testbed.getTestbedName() + "' set to " + testbed.getDeploymentStatus(),
                testbed.getId()
        );

        return TestbedSponsorshipDto.fromEntity(testbed);
    }

    @Override
    @Transactional
    public TestbedSponsorshipDto uploadEvidence(Long userId, Long testbedId, List<MultipartFile> files) {
        IndustryProfile profile = resolveProfile(userId);
        TestbedSponsorship testbed = testbedRepository.findByIdAndIndustryProfileId(testbedId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Field testbed deployment not found: " + testbedId));

        if (files == null || files.isEmpty()) {
            return TestbedSponsorshipDto.fromEntity(testbed);
        }

        List<String> currentUrls = new ArrayList<>();
        if (testbed.getEvidencePhotoUrls() != null && !testbed.getEvidencePhotoUrls().isBlank()) {
            try {
                currentUrls = objectMapper.readValue(testbed.getEvidencePhotoUrls(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                currentUrls = Arrays.stream(testbed.getEvidencePhotoUrls().split(","))
                        .map(s -> s.trim())
                        .filter(s -> !s.isBlank())
                        .collect(Collectors.toList());
            }
        }

        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                try {
                    FileStorageService.StoredFile stored = fileStorageService.storeFile(file, "testbeds/" + testbedId);
                    currentUrls.add(stored.fileUrl());
                } catch (Exception e) {
                    log.error("Failed to store evidence photo for testbed: {}", testbedId, e);
                }
            }
        }

        try {
            testbed.setEvidencePhotoUrls(objectMapper.writeValueAsString(currentUrls));
        } catch (Exception e) {
            testbed.setEvidencePhotoUrls(String.join(",", currentUrls));
        }

        testbed = testbedRepository.save(testbed);

        publishTestbedEvent(
                "TESTBED_EVIDENCE_UPLOADED",
                "Field Evidence Uploaded",
                files.size() + " verification photos submitted for " + testbed.getTestbedName(),
                testbed.getId()
        );

        return TestbedSponsorshipDto.fromEntity(testbed);
    }

    @SuppressWarnings("null")
    @Override
    @Transactional(readOnly = true)
    public List<TestbedDistrictSummaryDto> getDistrictSummary(Long userId) {
        IndustryProfile profile = resolveProfile(userId);
        List<TestbedSponsorship> all = testbedRepository.findByIndustryProfileId(profile.getId());

        Map<String, List<TestbedSponsorship>> grouped = all.stream()
                .collect(Collectors.groupingBy(t -> t.getDistrict() != null ? t.getDistrict() : "Unknown"));

        return grouped.entrySet().stream()
                .map(e -> {
                    String district = e.getKey();
                    List<TestbedSponsorship> list = e.getValue();
                    long activeCount = list.size();
                    long beneficiaries = list.stream().mapToLong(t -> t.getBeneficiariesImpacted() != null ? t.getBeneficiariesImpacted() : 0L).sum();
                    long liveCount = list.stream().filter(t -> t.getDeploymentStatus() == DeploymentStatus.LIVE).count();
                    return new TestbedDistrictSummaryDto(district, activeCount, beneficiaries, liveCount);
                })
                .sorted(Comparator.comparing(TestbedDistrictSummaryDto::getTotalBeneficiaries).reversed())
                .toList();
    }

    @Override
    @Transactional
    public void deleteTestbed(Long userId, Long testbedId) {
        IndustryProfile profile = resolveProfile(userId);
        TestbedSponsorship testbed = testbedRepository.findByIdAndIndustryProfileId(testbedId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Field testbed deployment not found: " + testbedId));
        testbedRepository.delete(testbed);
    }

    private List<TestbedSponsorship> seedDefaultTestbeds(IndustryProfile profile) {
        TestbedSponsorship t1 = new TestbedSponsorship();
        t1.setIndustryProfile(profile);
        t1.setTestbedName("Ranchi Rural Solar Microgrid & IoT Lab");
        t1.setDistrict("Ranchi");
        t1.setBlock("Kanke");
        t1.setVillageOrLocation("Sukhurhutu Village Cluster");
        t1.setProjectName("Off-Grid Solar Micro-Grid Controller");
        t1.setPilotPhase("Phase 2 - Live Telemetry");
        t1.setBeneficiariesImpacted(1850L);
        t1.setBeneficiaryCount(1850);
        t1.setDeploymentStatus(DeploymentStatus.LIVE);
        t1.setStatus("LIVE");
        t1.setLiveDataFeedUrl("https://telemetry.jharkhand-innovation.gov.in/testbeds/ranchi-solar");
        t1.setEvidencePhotoUrls("[\"https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800\",\"https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800\"]");
        t1.setStartedAt(LocalDate.now().minusMonths(4));

        TestbedSponsorship t2 = new TestbedSponsorship();
        t2.setIndustryProfile(profile);
        t2.setTestbedName("Dhanbad Coal Mining Particulate Sensor Array");
        t2.setDistrict("Dhanbad");
        t2.setBlock("Jharia");
        t2.setVillageOrLocation("Bhowra Colliery Buffer Zone");
        t2.setProjectName("Air Quality & Particulate Telemetry Array");
        t2.setPilotPhase("Phase 1 - Sensor Calibration");
        t2.setBeneficiariesImpacted(5400L);
        t2.setBeneficiaryCount(5400);
        t2.setDeploymentStatus(DeploymentStatus.LIVE);
        t2.setStatus("LIVE");
        t2.setLiveDataFeedUrl("https://telemetry.jharkhand-innovation.gov.in/testbeds/dhanbad-air");
        t2.setEvidencePhotoUrls("[\"https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800\"]");
        t2.setStartedAt(LocalDate.now().minusMonths(2));

        TestbedSponsorship t3 = new TestbedSponsorship();
        t3.setIndustryProfile(profile);
        t3.setTestbedName("East Singhbhum Cold Chain Post-Harvest Testbed");
        t3.setDistrict("East Singhbhum");
        t3.setBlock("Ghatshila");
        t3.setVillageOrLocation("Moubhandar Agro Hub");
        t3.setProjectName("Solar-Assisted Zero-Energy Vegetable Cold Storage");
        t3.setPilotPhase("Phase 3 - Validation & Certification");
        t3.setBeneficiariesImpacted(920L);
        t3.setBeneficiaryCount(920);
        t3.setDeploymentStatus(DeploymentStatus.COMPLETED);
        t3.setStatus("COMPLETED");
        t3.setEvidencePhotoUrls("[\"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800\"]");
        t3.setStartedAt(LocalDate.now().minusMonths(7));
        t3.setCompletedAt(LocalDate.now().minusWeeks(2));

        return testbedRepository.saveAll(List.of(t1, t2, t3));
    }

    private void publishTestbedEvent(String type, String title, String message, Long entityId) {
        try {
            NotificationEvent event = new NotificationEvent();
            event.setEventType(type);
            event.setTitle(title);
            event.setMessage(message);
            event.setSource("backend.field_testbeds");
            event.setRecipientUserType("INDUSTRY_PARTNER");
            event.setReferenceEntityId(entityId);
            event.setReferenceEntityType("TESTBED_SPONSORSHIP");
            event.setSeverity("INFO");
            eventPublisher.publishIndustryNotification(event);
        } catch (Exception e) {
            log.warn("Failed to publish testbed event: {}", e.getMessage());
        }
    }
}
