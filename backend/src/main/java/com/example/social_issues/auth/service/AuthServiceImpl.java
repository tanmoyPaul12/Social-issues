package com.example.social_issues.auth.service;

import com.example.social_issues.auth.dto.*;
import com.example.social_issues.auth.model.*;
import com.example.social_issues.auth.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final String MASTER_OTP = "123456";

    private final UserRepository userRepository;
    private final CitizenProfileRepository citizenProfileRepository;
    private final OtpSessionRepository otpSessionRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService;
    private final RedisSessionService redisSessionService;
    private final Random random = new Random();

    public AuthServiceImpl(UserRepository userRepository,
                           CitizenProfileRepository citizenProfileRepository,
                           OtpSessionRepository otpSessionRepository,
                           JwtService jwtService,
                           RedisSessionService redisSessionService) {
        this.userRepository = userRepository;
        this.citizenProfileRepository = citizenProfileRepository;
        this.otpSessionRepository = otpSessionRepository;
        this.jwtService = jwtService;
        this.redisSessionService = redisSessionService;
    }

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        // Check if phone or email already registered
        if (!email.isBlank() && userRepository.existsByEmail(email)) {
            return AuthResponse.error("An account with this email address already exists. Please sign in instead.");
        }
        if (!phone.isBlank() && userRepository.existsByPhone(phone)) {
            return AuthResponse.error("An account with this mobile number already exists. Please sign in instead.");
        }

        EntityType entityType = request.getEntityType() != null ? request.getEntityType() : EntityType.INDIVIDUAL;

        String finalName = request.getName() != null ? request.getName().trim() : "";
        if (entityType == EntityType.GROUP && request.getGroupName() != null && !request.getGroupName().isBlank()) {
            finalName = request.getGroupName();
        } else if (entityType == EntityType.ORGANIZATION && request.getOrgName() != null && !request.getOrgName().isBlank()) {
            finalName = request.getOrgName();
        }

        // 1. Create Core User in users table
        User user = new User();
        user.setName(finalName.isBlank() ? "Citizen Member" : finalName);
        user.setPhone(phone.isBlank() ? "9" + (100000000 + random.nextInt(900000000)) : phone);
        user.setEmail(!email.isBlank() ? email : user.getPhone() + "@citizen.jharkhand.gov.in");
        user.setRole(Role.CITIZEN);
        user.setVerified(true);
        user.setVerificationStatus(VerificationStatus.APPROVED);
        user.setReferenceId("CIT-JH-2026-" + (100 + random.nextInt(900)));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        } else {
            user.setPasswordHash(passwordEncoder.encode("JH@" + user.getPhone()));
        }

        user = userRepository.save(user);

        // 2. Create CitizenProfile in citizen_profiles table
        CitizenProfile citizenProfile = new CitizenProfile();
        citizenProfile.setUser(user);
        citizenProfile.setEntityType(entityType);
        citizenProfile.setDistrict(request.getDistrict() != null ? request.getDistrict() : "Ranchi");
        citizenProfile.setBlock(request.getBlock());
        citizenProfile.setLanguage(request.getLanguage() != null ? request.getLanguage() : "हिन्दी (Hindi)");

        if (entityType == EntityType.GROUP) {
            citizenProfile.setGroupName(finalName);
            citizenProfile.setLeaderSpoc(request.getLeaderSpoc() != null ? request.getLeaderSpoc() : request.getName());
            citizenProfile.setMemberCount(request.getMemberCount() != null ? request.getMemberCount() : 10);
        }

        if (entityType == EntityType.ORGANIZATION) {
            citizenProfile.setOrgName(finalName);
            citizenProfile.setOrgCode(request.getOrgCode() != null ? request.getOrgCode() : "GP-JH-" + citizenProfile.getDistrict().toUpperCase() + "-01");
            citizenProfile.setNodalPerson(request.getNodalPerson() != null ? request.getNodalPerson() : request.getName());
        }

        citizenProfileRepository.save(citizenProfile);
        user.setCitizenProfile(citizenProfile);

        String token = jwtService.generateToken(user);
        UserSummaryDto userDto = UserSummaryDto.fromEntity(user);
        redisSessionService.saveSession(token, userDto, Duration.ofDays(7));

        log.info("Citizen account created in citizen_profiles for: [{}] ({})", user.getPhone(), user.getId());
        return AuthResponse.success("Account registered successfully.", token, userDto);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
            String identifier = request.getIdentifier() != null ? request.getIdentifier().trim() : "";
            String phone = request.getPhone() != null ? request.getPhone().trim() : "";

            // Find all matching user candidates
            List<User> candidates;
            if (!email.isBlank()) {
                candidates = userRepository.findAllByEmailIgnoreCase(email);
            } else if (!identifier.isBlank()) {
                candidates = userRepository.findAllByEmailIgnoreCase(identifier);
                if (candidates.isEmpty()) {
                    candidates = userRepository.findAllByPhone(identifier);
                }
            } else if (!phone.isBlank()) {
                candidates = userRepository.findAllByPhone(phone);
            } else {
                return AuthResponse.error("Please enter your email or phone number.", "MISSING_IDENTIFIER");
            }

            if (candidates == null || candidates.isEmpty()) {
                return AuthResponse.error("No registered account found with this email. Please register your account first.", "ACCOUNT_NOT_FOUND");
            }

            String rawPassword = request.getPassword() != null ? request.getPassword().trim() : "";
            User authenticatedUser = null;

            if ("password".equalsIgnoreCase(request.getLoginType()) || !rawPassword.isBlank()) {
                if (rawPassword.isBlank()) {
                    return AuthResponse.error("Password is required.", "MISSING_PASSWORD");
                }
                // Try matching across candidates (supports clean login if multiple test accounts exist)
                for (User u : candidates) {
                    if (u.getPasswordHash() != null && passwordEncoder.matches(rawPassword, u.getPasswordHash())) {
                        authenticatedUser = u;
                        break;
                    }
                }

                if (authenticatedUser == null) {
                    return AuthResponse.error("Invalid credentials. Email or password is incorrect. Please check and try again.", "INVALID_CREDENTIALS");
                }
            } else if ("otp".equalsIgnoreCase(request.getLoginType())) {
                String otp = request.getOtp();
                if (otp == null || otp.isBlank() || (!otp.equals(MASTER_OTP) && otp.length() != 6)) {
                    return AuthResponse.error("Invalid OTP code.", "INVALID_OTP");
                }
                authenticatedUser = candidates.get(0);
            } else {
                return AuthResponse.error("Invalid login parameters. Please check your credentials.", "INVALID_CREDENTIALS");
            }

            Role activeRole = authenticatedUser.getRole();
            if (request.getPortalRole() != null && !request.getPortalRole().isBlank()) {
                try {
                    Role targetRole = Role.valueOf(request.getPortalRole().trim().toUpperCase());
                    if (targetRole == Role.UNIVERSITY && authenticatedUser.getUniversityProfile() == null && authenticatedUser.getRole() != Role.UNIVERSITY) {
                        return AuthResponse.error("No registered University / Academic Lab profile found for this account. Please complete institutional onboarding.", "PROFILE_NOT_FOUND");
                    }
                    if (targetRole == Role.INDUSTRY && authenticatedUser.getIndustryProfile() == null && authenticatedUser.getRole() != Role.INDUSTRY) {
                        return AuthResponse.error("No registered Corporate CSR / Enterprise profile found for this account. Please complete industry onboarding.", "PROFILE_NOT_FOUND");
                    }
                    if (targetRole == Role.GOVERNMENT && authenticatedUser.getGovernmentProfile() == null && authenticatedUser.getRole() != Role.GOVERNMENT) {
                        return AuthResponse.error("No registered Government Department profile found for this account.", "PROFILE_NOT_FOUND");
                    }
                    activeRole = targetRole;
                } catch (IllegalArgumentException e) {
                    log.warn("Unknown portal role requested: {}", request.getPortalRole());
                }
            }

            String token = jwtService.generateToken(authenticatedUser, activeRole);
            UserSummaryDto userDto = UserSummaryDto.fromEntity(authenticatedUser, activeRole);

            Duration ttl = request.isRememberMe() ? Duration.ofDays(30) : Duration.ofDays(7);
            redisSessionService.saveSession(token, userDto, ttl);

            return AuthResponse.success("Welcome back, " + authenticatedUser.getName() + "!", token, userDto);
        } catch (Exception e) {
            log.error("Login exception: ", e);
            return AuthResponse.error("Authentication service encountered an issue. Please try again.", "SERVER_ERROR");
        }
    }

    @Override
    @Transactional
    public AuthResponse sendOtp(OtpSendRequest request) {
        String phone = request.getPhone().trim();
        String otp = "123456"; // Default testing sandbox master OTP
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        OtpSession session = new OtpSession(phone, otp, expiresAt);
        otpSessionRepository.save(session);

        log.info("OTP generated for [{}]: {}", phone, otp);
        return AuthResponse.success("OTP sent successfully to " + phone);
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        String phone = request.getPhone().trim();
        String otp = request.getOtp().trim();

        if (!otp.equals(MASTER_OTP)) {
            Optional<OtpSession> sessionOpt = otpSessionRepository.findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(phone);
            if (sessionOpt.isEmpty()) {
                return AuthResponse.error("No OTP request found for this number. Please request a new OTP.");
            }

            OtpSession session = sessionOpt.get();
            if (session.isExpired()) {
                return AuthResponse.error("OTP has expired. Please request a new one.");
            }

            if (!session.getOtp().equals(otp)) {
                return AuthResponse.error("Incorrect OTP code. Please try again.");
            }

            session.setVerified(true);
            otpSessionRepository.save(session);
        }

        Optional<User> userOpt = userRepository.findFirstByPhoneOrderByIdDesc(phone);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtService.generateToken(user);
            UserSummaryDto userDto = UserSummaryDto.fromEntity(user);
            redisSessionService.saveSession(token, userDto, Duration.ofDays(7));
            return AuthResponse.success("OTP verified successfully.", token, userDto);
        }

        return AuthResponse.success("OTP verified. Please complete your registration.");
    }

    @Override
    public UserSummaryDto getCurrentUser(String tokenOrHeader) {
        String token = cleanToken(tokenOrHeader);
        if (token == null || token.isBlank()) {
            return null;
        }

        // Try fast in-memory or Redis cache
        UserSummaryDto cachedUser = redisSessionService.getSession(token);
        if (cachedUser != null) {
            return cachedUser;
        }

        // Fallback: extract userId from JWT and reload from DB
        String userIdStr = jwtService.extractUserId(token);
        if (userIdStr != null) {
            try {
                Long userId = Long.parseLong(userIdStr);
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    UserSummaryDto dto = UserSummaryDto.fromEntity(userOpt.get());
                    redisSessionService.saveSession(token, dto, Duration.ofDays(7));
                    return dto;
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }

    @Override
    public void logout(String tokenOrHeader) {
        String token = cleanToken(tokenOrHeader);
        if (token != null && !token.isBlank()) {
            redisSessionService.deleteSession(token);
        }
    }

    private String cleanToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        if (authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return authHeader.trim();
    }
}
