package com.example.social_issues.auth.service;

import com.example.social_issues.auth.dto.AuthResponse;
import com.example.social_issues.auth.dto.InstitutionalOnboardingRequest;
import com.example.social_issues.auth.dto.UserSummaryDto;
import com.example.social_issues.auth.model.*;
import com.example.social_issues.auth.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Optional;
import java.util.Random;

@Service
public class InstitutionalOnboardingService {

    private static final Logger log = LoggerFactory.getLogger(InstitutionalOnboardingService.class);

    private final UserRepository userRepository;
    private final UniversityProfileRepository universityProfileRepository;
    private final IndustryProfileRepository industryProfileRepository;
    private final GovernmentProfileRepository governmentProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService;
    private final RedisSessionService redisSessionService;
    private final Random random = new Random();

    public InstitutionalOnboardingService(UserRepository userRepository,
                                          UniversityProfileRepository universityProfileRepository,
                                          IndustryProfileRepository industryProfileRepository,
                                          GovernmentProfileRepository governmentProfileRepository,
                                          JwtService jwtService,
                                          RedisSessionService redisSessionService) {
        this.userRepository = userRepository;
        this.universityProfileRepository = universityProfileRepository;
        this.industryProfileRepository = industryProfileRepository;
        this.governmentProfileRepository = governmentProfileRepository;
        this.jwtService = jwtService;
        this.redisSessionService = redisSessionService;
    }

    @Transactional
    public AuthResponse onboardUniversity(InstitutionalOnboardingRequest req) {
        try {
            if (req == null) {
                return AuthResponse.error("Onboarding request cannot be empty.");
            }

            String univName = req.getUnivName() != null ? req.getUnivName().trim() : "";
            if (univName.isBlank()) {
                return AuthResponse.error("Institution Name is required.");
            }

            String aisheCode = req.getAisheCode() != null ? req.getAisheCode().trim() : "";
            if (aisheCode.isBlank()) {
                return AuthResponse.error("AISHE Code / UGC ID is required.");
            }

            String name = req.getName() != null ? req.getName().trim() : "";
            if (name.isBlank()) {
                return AuthResponse.error("Nodal SPOC Full Name is required.");
            }

            String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
            if (email.isBlank() || !email.contains("@")) {
                return AuthResponse.error("A valid institutional contact email is required.");
            }

            String phone = req.getPhone() != null ? req.getPhone().trim() : "";
            if (phone.isBlank()) {
                return AuthResponse.error("Contact phone number is required.");
            }

            String rawPassword = req.getPassword() != null ? req.getPassword().trim() : "";
            if (rawPassword.length() < 6) {
                return AuthResponse.error("Password must be at least 6 characters long.");
            }

            // 1. Create or update User in users table
            Optional<User> existingEmail = userRepository.findFirstByEmailIgnoreCaseOrderByIdDesc(email);
            Optional<User> existingPhone = userRepository.findFirstByPhoneOrderByIdDesc(phone);

            if (existingPhone.isPresent() && (existingEmail.isEmpty() || !existingPhone.get().getId().equals(existingEmail.get().getId()))) {
                return AuthResponse.error("The mobile number (" + phone + ") is already registered with another account. Please use your direct mobile number or sign in.");
            }

            User user = existingEmail.orElseGet(() -> existingPhone.orElseGet(User::new));

            user.setName(name);
            user.setPhone(phone);
            user.setEmail(email);
            user.setRole(Role.UNIVERSITY);
            user.setVerificationStatus(VerificationStatus.APPROVED);
            user.setVerified(true);
            if (user.getReferenceId() == null) {
                user.setReferenceId("HEI-JH-2026-" + (100 + random.nextInt(900)));
            }
            user.setPasswordHash(passwordEncoder.encode(rawPassword));

            user = userRepository.save(user);

            // 2. Create or update UniversityProfile in university_profiles table
            UniversityProfile profile = user.getUniversityProfile();
            if (profile == null) {
                profile = new UniversityProfile();
                profile.setUser(user);
            }
            profile.setUnivName(univName);
            profile.setAisheCode(aisheCode);
            profile.setUnivCategory(req.getUnivCategory() != null ? req.getUnivCategory() : "Institute of National Importance (IIT/NIT/IIM)");
            profile.setNodalSpocName(name);
            profile.setDesignation(req.getDesignation() != null && !req.getDesignation().isBlank() ? req.getDesignation().trim() : "Dean R&D / Institutional SPOC");
            profile.setDistrict(req.getDistrict() != null && !req.getDistrict().isBlank() ? req.getDistrict() : "Ranchi");
            profile.setHasIncubationCenter(Boolean.TRUE.equals(req.getHasIncubationCenter()));

            if (req.getDisciplines() != null && req.getDisciplines().length > 0) {
                profile.setDisciplines(String.join(", ", req.getDisciplines()));
            }

            universityProfileRepository.save(profile);
            user.setUniversityProfile(profile);

            String token = jwtService.generateToken(user, Role.UNIVERSITY);
            UserSummaryDto userDto = UserSummaryDto.fromEntity(user, Role.UNIVERSITY);
            redisSessionService.saveSession(token, userDto, Duration.ofDays(7));

            log.info("University onboarded successfully into university_profiles: [{}] ({})", profile.getUnivName(), user.getReferenceId());
            return AuthResponse.success("University registered successfully.", token, userDto);
        } catch (Exception e) {
            log.error("Error onboarding university: {}", e.getMessage(), e);
            return AuthResponse.error("University registration failed: " + (e.getMessage() != null ? e.getMessage() : "Unexpected error."));
        }
    }

    @Transactional
    public AuthResponse onboardIndustry(InstitutionalOnboardingRequest req) {
        try {
            if (req == null) {
                return AuthResponse.error("Onboarding request cannot be empty.");
            }

            String companyName = req.getCompanyName() != null ? req.getCompanyName().trim() : "";
            if (companyName.isBlank()) {
                return AuthResponse.error("Company / Enterprise Name is required.");
            }

            String gstin = req.getGstin() != null ? req.getGstin().trim() : "";
            if (gstin.isBlank()) {
                return AuthResponse.error("GSTIN or Corporate Identifier is required.");
            }

            String name = req.getName() != null ? req.getName().trim() : "";
            if (name.isBlank()) {
                return AuthResponse.error("Authorized SPOC Full Name is required.");
            }

            String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
            if (email.isBlank() || !email.contains("@")) {
                return AuthResponse.error("A valid corporate contact email is required.");
            }

            String phone = req.getPhone() != null ? req.getPhone().trim() : "";
            if (phone.isBlank()) {
                return AuthResponse.error("Contact phone number is required.");
            }

            String rawPassword = req.getPassword() != null ? req.getPassword().trim() : "";
            if (rawPassword.length() < 6) {
                return AuthResponse.error("Password must be at least 6 characters long.");
            }

            // 1. Create or update User in users table
            Optional<User> existingEmail = userRepository.findFirstByEmailIgnoreCaseOrderByIdDesc(email);
            Optional<User> existingPhone = userRepository.findFirstByPhoneOrderByIdDesc(phone);

            if (existingPhone.isPresent() && (existingEmail.isEmpty() || !existingPhone.get().getId().equals(existingEmail.get().getId()))) {
                return AuthResponse.error("The mobile number (" + phone + ") is already registered with another account. Please use your direct mobile number or sign in.");
            }

            User user = existingEmail.orElseGet(() -> existingPhone.orElseGet(User::new));

            user.setName(name);
            user.setPhone(phone);
            user.setEmail(email);
            user.setRole(Role.INDUSTRY);
            user.setVerificationStatus(VerificationStatus.APPROVED);
            user.setVerified(true);
            if (user.getReferenceId() == null) {
                user.setReferenceId("CSR-JH-2026-" + (100 + random.nextInt(900)));
            }
            user.setPasswordHash(passwordEncoder.encode(rawPassword));

            user = userRepository.save(user);

            // 2. Create or update IndustryProfile in industry_profiles table
            IndustryProfile profile = user.getIndustryProfile();
            if (profile == null) {
                profile = new IndustryProfile();
                profile.setUser(user);
            }
            profile.setCompanyName(companyName);
            profile.setCompanyType(req.getCompanyType());
            profile.setGstin(gstin);
            profile.setCinNumber(req.getCinNumber());
            profile.setCsrNumber(req.getCsrNumber());
            profile.setSpocName(name);
            profile.setDesignation(req.getDesignation() != null && !req.getDesignation().isBlank() ? req.getDesignation() : "Head CSR & Sustainability");
            profile.setDistrict(req.getDistrict() != null && !req.getDistrict().isBlank() ? req.getDistrict() : "East Singhbhum (Jamshedpur)");

            if (req.getSectors() != null && req.getSectors().length > 0) {
                profile.setSectors(String.join(", ", req.getSectors()));
            }

            industryProfileRepository.save(profile);
            user.setIndustryProfile(profile);

            String token = jwtService.generateToken(user, Role.INDUSTRY);
            UserSummaryDto userDto = UserSummaryDto.fromEntity(user, Role.INDUSTRY);
            redisSessionService.saveSession(token, userDto, Duration.ofDays(7));

            log.info("Industry partner onboarded successfully into industry_profiles: [{}] ({})", profile.getCompanyName(), user.getReferenceId());
            return AuthResponse.success("Corporate CSR partner registered successfully.", token, userDto);
        } catch (Exception e) {
            log.error("Error onboarding industry: {}", e.getMessage(), e);
            return AuthResponse.error("Industry registration failed: " + (e.getMessage() != null ? e.getMessage() : "Unexpected error."));
        }
    }

    @Transactional
    public AuthResponse onboardGovernment(InstitutionalOnboardingRequest req) {
        try {
            if (req == null) {
                return AuthResponse.error("Provisioning request cannot be empty.");
            }

            String dept = req.getGovtDepartment() != null ? req.getGovtDepartment().trim() : "";
            if (dept.isBlank()) {
                return AuthResponse.error("Government Department is required.");
            }

            String name = req.getName() != null ? req.getName().trim() : "";
            if (name.isBlank()) {
                return AuthResponse.error("Nodal Officer Name is required.");
            }

            String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
            if (email.isBlank() || !email.contains("@")) {
                return AuthResponse.error("Official official email is required.");
            }

            String phone = req.getPhone() != null ? req.getPhone().trim() : "";
            if (phone.isBlank()) {
                return AuthResponse.error("Official contact phone is required.");
            }

            String rawPassword = req.getPassword() != null ? req.getPassword().trim() : "";
            if (rawPassword.length() < 6) {
                return AuthResponse.error("Password must be at least 6 characters long.");
            }

            // 1. Create or update User in users table
            Optional<User> existingEmail = userRepository.findFirstByEmailIgnoreCaseOrderByIdDesc(email);
            Optional<User> existingPhone = userRepository.findFirstByPhoneOrderByIdDesc(phone);

            if (existingPhone.isPresent() && (existingEmail.isEmpty() || !existingPhone.get().getId().equals(existingEmail.get().getId()))) {
                return AuthResponse.error("The mobile number (" + phone + ") is already registered with another account. Please use your direct mobile number or sign in.");
            }

            User user = existingEmail.orElseGet(() -> existingPhone.orElseGet(User::new));

            user.setName(name);
            user.setPhone(phone);
            user.setEmail(email);
            user.setRole(Role.GOVERNMENT);
            user.setVerificationStatus(VerificationStatus.APPROVED);
            user.setVerified(true);
            if (user.getReferenceId() == null) {
                user.setReferenceId("GOV-JH-2026-" + (100 + random.nextInt(900)));
            }
            user.setPasswordHash(passwordEncoder.encode(rawPassword));

            user = userRepository.save(user);

            // 2. Create or update GovernmentProfile in government_profiles table
            GovernmentProfile profile = user.getGovernmentProfile();
            if (profile == null) {
                profile = new GovernmentProfile();
                profile.setUser(user);
            }
            profile.setDeptName(dept);
            profile.setServiceCode(req.getServiceCode() != null ? req.getServiceCode().trim() : "JH-IAS-" + (1000 + random.nextInt(9000)));
            profile.setNodalOfficerName(name);
            profile.setDesignation(req.getDesignation() != null && !req.getDesignation().isBlank() ? req.getDesignation() : "Nodal Officer");
            profile.setDistrict(req.getDistrict() != null && !req.getDistrict().isBlank() ? req.getDistrict() : "Ranchi");
            profile.setPanchayatCode(req.getPanchayatCode());

            governmentProfileRepository.save(profile);
            user.setGovernmentProfile(profile);

            String token = jwtService.generateToken(user, Role.GOVERNMENT);
            UserSummaryDto userDto = UserSummaryDto.fromEntity(user, Role.GOVERNMENT);
            redisSessionService.saveSession(token, userDto, Duration.ofDays(7));

            log.info("Government officer provisioned into government_profiles: [{}] ({})", profile.getDeptName(), user.getReferenceId());
            return AuthResponse.success("Government officer provisioned successfully.", token, userDto);
        } catch (Exception e) {
            log.error("Error provisioning government officer: {}", e.getMessage(), e);
            return AuthResponse.error("Government provisioning failed: " + (e.getMessage() != null ? e.getMessage() : "Unexpected error."));
        }
    }
}
