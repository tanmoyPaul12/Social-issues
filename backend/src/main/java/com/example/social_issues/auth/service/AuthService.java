package com.example.social_issues.auth.service;

import com.example.social_issues.auth.dto.*;

public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse sendOtp(OtpSendRequest request);
    AuthResponse verifyOtp(OtpVerifyRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    UserSummaryDto getCurrentUser(String token);
    void logout(String token);
    void logout(String token, String refreshToken);
}
