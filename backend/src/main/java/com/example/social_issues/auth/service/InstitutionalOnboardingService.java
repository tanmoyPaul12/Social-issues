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
import java.util.*;

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

            User user;
            if (existingEmail.isPresent()) {
                user = existingEmail.get();
            } else if (existingPhone.isPresent()) {
                user = existingPhone.get();
            } else {
                user = new User();
            }

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

            String accessToken = jwtService.generateAccessToken(user, Role.UNIVERSITY);
            String refreshToken = jwtService.generateRefreshToken(user, Role.UNIVERSITY, false);
            UserSummaryDto userDto = UserSummaryDto.fromEntity(user, Role.UNIVERSITY);

            redisSessionService.saveSession(accessToken, userDto, Duration.ofMinutes(15));
            redisSessionService.saveRefreshToken(refreshToken, user.getId(), Role.UNIVERSITY.name(), Duration.ofDays(7));

            log.info("University onboarded successfully into university_profiles: [{}] ({})", profile.getUnivName(), user.getReferenceId());
            return AuthResponse.success("University registered successfully.", accessToken, refreshToken, jwtService.getAccessExpirationSeconds(), userDto);
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
                if (req.getDpiitRecognitionNumber() != null && !req.getDpiitRecognitionNumber().isBlank()) {
                    gstin = req.getDpiitRecognitionNumber().trim();
                } else if (req.getUdyamRegistrationNumber() != null && !req.getUdyamRegistrationNumber().isBlank()) {
                    gstin = req.getUdyamRegistrationNumber().trim();
                } else if (req.getTaxExemptionNumber() != null && !req.getTaxExemptionNumber().isBlank()) {
                    gstin = req.getTaxExemptionNumber().trim();
                } else if (req.getInstitutionRegNumber() != null && !req.getInstitutionRegNumber().isBlank()) {
                    gstin = req.getInstitutionRegNumber().trim();
                } else {
                    return AuthResponse.error("Statutory Registration Identifier (GSTIN, DPIIT, Udyam, 12A/80G, or Institution ID) is required.");
                }
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

            User user;
            if (existingEmail.isPresent()) {
                user = existingEmail.get();
            } else if (existingPhone.isPresent()) {
                user = existingPhone.get();
            } else {
                user = new User();
            }

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
            if (req.getPartnerCategory() != null) {
                profile.setPartnerCategory(req.getPartnerCategory());
            }
            profile.setDpiitRecognitionNumber(req.getDpiitRecognitionNumber());
            profile.setUdyamRegistrationNumber(req.getUdyamRegistrationNumber());
            profile.setTaxExemptionNumber(req.getTaxExemptionNumber());
            profile.setInstitutionRegNumber(req.getInstitutionRegNumber());
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

            String accessToken = jwtService.generateAccessToken(user, Role.INDUSTRY);
            String refreshToken = jwtService.generateRefreshToken(user, Role.INDUSTRY, false);
            UserSummaryDto userDto = UserSummaryDto.fromEntity(user, Role.INDUSTRY);

            redisSessionService.saveSession(accessToken, userDto, Duration.ofMinutes(15));
            redisSessionService.saveRefreshToken(refreshToken, user.getId(), Role.INDUSTRY.name(), Duration.ofDays(7));

            log.info("Industry partner onboarded successfully into industry_profiles: [{}] ({})", profile.getCompanyName(), user.getReferenceId());
            return AuthResponse.success("Corporate CSR partner registered successfully.", accessToken, refreshToken, jwtService.getAccessExpirationSeconds(), userDto);
        } catch (Exception e) {
            log.error("Error onboarding industry: {}", e.getMessage(), e);
            return AuthResponse.error("Industry registration failed: " + (e.getMessage() != null ? e.getMessage() : "Unexpected error."));
        }
    }

    public static final List<String> JHARKHAND_OFFICIAL_DISTRICTS = List.of(
            "Ranchi", "Dhanbad", "East Singhbhum (Jamshedpur)", "West Singhbhum (Chaibasa)", "Bokaro", "Hazaribagh",
            "Deoghar", "Dumka", "Giridih", "Ramgarh", "Palamu", "Chatra", "Garhwa", "Godda", "Gumla",
            "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Sahibganj", "Saraikela Kharsawan", "Simdega"
    );

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getGovernmentDistrictsStatus() {
        List<GovernmentProfile> profiles = governmentProfileRepository.findAll();
        Map<String, GovernmentProfile> profileByDistrict = new HashMap<>();
        GovernmentProfile stateSuperAdminProfile = null;

        for (GovernmentProfile gp : profiles) {
            if (Boolean.TRUE.equals(gp.getIsStateSuperAdmin()) || "statewide".equalsIgnoreCase(gp.getDistrict())) {
                stateSuperAdminProfile = gp;
            }
            if (gp.getDistrict() != null && !gp.getDistrict().isBlank()) {
                profileByDistrict.put(gp.getDistrict().trim().toLowerCase(), gp);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        // 1. First entry: Statewide Directorate Superadmin Seat (Singleton)
        Map<String, Object> stateMap = new LinkedHashMap<>();
        stateMap.put("district", "Statewide (All 24 Districts)");
        stateMap.put("isStateSuperAdmin", true);
        if (stateSuperAdminProfile != null) {
            stateMap.put("isAssigned", true);
            String officerName = stateSuperAdminProfile.getNodalOfficerName();
            if ((officerName == null || officerName.isBlank()) && stateSuperAdminProfile.getUser() != null) {
                officerName = stateSuperAdminProfile.getUser().getName();
            }
            stateMap.put("nodalOfficerName", officerName != null ? officerName : "State Nodal Director");
            stateMap.put("serviceCode", stateSuperAdminProfile.getServiceCode());
            stateMap.put("designation", stateSuperAdminProfile.getDesignation() != null ? stateSuperAdminProfile.getDesignation() : "State Nodal Director / Superadmin");
        } else {
            stateMap.put("isAssigned", false);
            stateMap.put("nodalOfficerName", null);
            stateMap.put("serviceCode", null);
            stateMap.put("designation", "State Nodal Director / Superadmin (Vacant)");
        }
        result.add(stateMap);

        // 2. The 24 District Nodal Officer Seats
        for (String district : JHARKHAND_OFFICIAL_DISTRICTS) {
            String distKey = district.trim().toLowerCase();
            String simpleKey = district.contains("(") ? district.substring(0, district.indexOf("(")).trim().toLowerCase() : distKey;

            GovernmentProfile matched = profileByDistrict.get(distKey);
            if (matched == null) {
                matched = profileByDistrict.get(simpleKey);
            }
            if (matched == null) {
                for (Map.Entry<String, GovernmentProfile> entry : profileByDistrict.entrySet()) {
                    if (entry.getValue() != null && !Boolean.TRUE.equals(entry.getValue().getIsStateSuperAdmin())) {
                        if (distKey.contains(entry.getKey()) || entry.getKey().contains(distKey) || simpleKey.contains(entry.getKey()) || entry.getKey().contains(simpleKey)) {
                            matched = entry.getValue();
                            break;
                        }
                    }
                }
            }

            Map<String, Object> distMap = new LinkedHashMap<>();
            distMap.put("district", district);
            distMap.put("isStateSuperAdmin", false);
            if (matched != null && !Boolean.TRUE.equals(matched.getIsStateSuperAdmin())) {
                distMap.put("isAssigned", true);
                String officerName = matched.getNodalOfficerName();
                if ((officerName == null || officerName.isBlank()) && matched.getUser() != null) {
                    officerName = matched.getUser().getName();
                }
                distMap.put("nodalOfficerName", officerName != null ? officerName : "Active Officer");
                distMap.put("serviceCode", matched.getServiceCode());
                distMap.put("designation", matched.getDesignation());
            } else {
                distMap.put("isAssigned", false);
                distMap.put("nodalOfficerName", null);
                distMap.put("serviceCode", null);
                distMap.put("designation", null);
            }
            result.add(distMap);
        }
        return result;
    }

    @Transactional
    public AuthResponse onboardGovernment(InstitutionalOnboardingRequest req) {
        try {
            if (req == null) {
                return AuthResponse.error("Provisioning request cannot be empty.");
            }

            String district = req.getDistrict() != null ? req.getDistrict().trim() : "";
            boolean isSuperAdmin = Boolean.TRUE.equals(req.getIsStateSuperAdmin()) 
                    || "Statewide (All 24 Districts)".equalsIgnoreCase(district) 
                    || "Statewide".equalsIgnoreCase(district);

            String name = req.getName() != null ? req.getName().trim() : "";
            if (name.isBlank()) {
                return AuthResponse.error("Nodal Officer Name is required.");
            }

            String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
            if (email.isBlank() || !email.contains("@")) {
                return AuthResponse.error("Official email is required.");
            }

            String phone = req.getPhone() != null ? req.getPhone().trim() : "";
            if (phone.isBlank()) {
                return AuthResponse.error("Official contact phone is required.");
            }

            String rawPassword = req.getPassword() != null ? req.getPassword().trim() : "";
            if (rawPassword.length() < 6) {
                return AuthResponse.error("Password must be at least 6 characters long.");
            }

            Role targetRole = isSuperAdmin ? Role.STATE_SUPERADMIN : Role.GOVERNMENT;

            if (isSuperAdmin) {
                // Check if a State Superadmin is already registered under a different email
                Optional<GovernmentProfile> existingSuper = governmentProfileRepository.findByIsStateSuperAdminTrue();
                if (existingSuper.isPresent()) {
                    GovernmentProfile sp = existingSuper.get();
                    boolean isSameAccount = sp.getUser() != null && email.equalsIgnoreCase(sp.getUser().getEmail());
                    if (!isSameAccount) {
                        String officer = sp.getNodalOfficerName() != null ? sp.getNodalOfficerName() : "Active Director";
                        return AuthResponse.error("A State Directorate Superadmin (" + officer + ") is already registered for Jharkhand. Only 1 statewide superadmin seat is permitted.");
                    }
                }
            } else {
                if (district.isBlank()) {
                    return AuthResponse.error("Please select a specific district jurisdiction. Each district must have one designated Nodal Officer.");
                }

                // Check if a Nodal Officer is already registered for this district
                List<GovernmentProfile> existingDistProfiles = governmentProfileRepository.findAll();
                String checkDist = district.toLowerCase();
                String checkSimple = district.contains("(") ? district.substring(0, district.indexOf("(")).trim().toLowerCase() : checkDist;

                for (GovernmentProfile gp : existingDistProfiles) {
                    if (gp.getDistrict() != null && !Boolean.TRUE.equals(gp.getIsStateSuperAdmin())) {
                        String existingD = gp.getDistrict().trim().toLowerCase();
                        String existingSimple = existingD.contains("(") ? existingD.substring(0, existingD.indexOf("(")).trim().toLowerCase() : existingD;
                        if (existingD.equals(checkDist) || existingSimple.equals(checkSimple) || existingD.contains(checkSimple) || checkDist.contains(existingSimple)) {
                            return AuthResponse.error("A designated Nodal Officer (" + (gp.getNodalOfficerName() != null ? gp.getNodalOfficerName() : "Active Officer") + ") is already registered for " + district + " District. Each district can only have one assigned Nodal Officer.");
                        }
                    }
                }
            }

            // 1. Create or update User in users table
            Optional<User> existingEmail = userRepository.findFirstByEmailIgnoreCaseOrderByIdDesc(email);
            Optional<User> existingPhone = userRepository.findFirstByPhoneOrderByIdDesc(phone);

            User user;
            if (existingEmail.isPresent()) {
                user = existingEmail.get();
            } else if (existingPhone.isPresent()) {
                user = existingPhone.get();
            } else {
                user = new User();
            }

            user.setName(name);
            user.setPhone(phone);
            user.setEmail(email);
            user.setRole(targetRole);
            user.setVerificationStatus(VerificationStatus.APPROVED);
            user.setVerified(true);
            if (user.getReferenceId() == null) {
                user.setReferenceId(isSuperAdmin ? "GOV-JH-STATE-" + (100 + random.nextInt(900)) : "GOV-JH-2026-" + (100 + random.nextInt(900)));
            }
            user.setPasswordHash(passwordEncoder.encode(rawPassword));

            user = userRepository.save(user);

            // 2. Create or update GovernmentProfile in government_profiles table
            GovernmentProfile profile = user.getGovernmentProfile();
            if (profile == null) {
                profile = new GovernmentProfile();
                profile.setUser(user);
            }

            if (isSuperAdmin) {
                String dept = req.getGovtDepartment() != null && !req.getGovtDepartment().isBlank()
                        ? req.getGovtDepartment().trim()
                        : "State Directorate of Higher & Technical Education";
                profile.setDeptName(dept);
                profile.setServiceCode(req.getServiceCode() != null && !req.getServiceCode().isBlank() ? req.getServiceCode().trim() : "JH-SEC-DIR-" + (1000 + random.nextInt(9000)));
                profile.setNodalOfficerName(name);
                profile.setDesignation(req.getDesignation() != null && !req.getDesignation().isBlank() ? req.getDesignation() : "State Nodal Director / Superadmin");
                profile.setDistrict("Statewide");
                profile.setIsStateSuperAdmin(true);
                profile.setJurisdictionLevel("STATEWIDE");
                profile.setPanchayatCode(req.getPanchayatCode());
            } else {
                String dept = req.getGovtDepartment() != null && !req.getGovtDepartment().isBlank() 
                        ? req.getGovtDepartment().trim() 
                        : "District Administration (" + district + ")";
                profile.setDeptName(dept);
                profile.setServiceCode(req.getServiceCode() != null && !req.getServiceCode().isBlank() ? req.getServiceCode().trim() : "JH-IAS-" + (1000 + random.nextInt(9000)));
                profile.setNodalOfficerName(name);
                profile.setDesignation(req.getDesignation() != null && !req.getDesignation().isBlank() ? req.getDesignation() : "District Nodal Officer");
                profile.setDistrict(district);
                profile.setIsStateSuperAdmin(false);
                profile.setJurisdictionLevel("DISTRICT");
                profile.setPanchayatCode(req.getPanchayatCode());
            }

            governmentProfileRepository.save(profile);
            user.setGovernmentProfile(profile);

            String accessToken = jwtService.generateAccessToken(user, targetRole);
            String refreshToken = jwtService.generateRefreshToken(user, targetRole, false);
            UserSummaryDto userDto = UserSummaryDto.fromEntity(user, targetRole);

            redisSessionService.saveSession(accessToken, userDto, Duration.ofMinutes(15));
            redisSessionService.saveRefreshToken(refreshToken, user.getId(), targetRole.name(), Duration.ofDays(7));

            if (isSuperAdmin) {
                log.info("State Directorate Superadmin provisioned successfully ({})", user.getReferenceId());
                return AuthResponse.success("State Directorate Superadmin provisioned successfully.", accessToken, refreshToken, jwtService.getAccessExpirationSeconds(), userDto);
            } else {
                log.info("Government Nodal Officer provisioned for district [{}] ({})", district, user.getReferenceId());
                return AuthResponse.success("Government Nodal Officer provisioned successfully for " + district + " District.", accessToken, refreshToken, jwtService.getAccessExpirationSeconds(), userDto);
            }
        } catch (Exception e) {
            log.error("Error provisioning government officer: {}", e.getMessage(), e);
            return AuthResponse.error("Government provisioning failed: " + (e.getMessage() != null ? e.getMessage() : "Unexpected error."));
        }
    }
}
