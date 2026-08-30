package com.example.social_issues.auth.dto;

public class AuthResponse {

    private boolean success;
    private String message;
    private String errorCode;
    private String accessToken;
    private String refreshToken;
    private String token; // alias for accessToken to ensure backward compatibility
    private long expiresIn; // seconds (e.g. 900)
    private String tokenType = "Bearer";
    private UserSummaryDto user;

    public AuthResponse() {
    }

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String message, String token, UserSummaryDto user) {
        this.success = success;
        this.message = message;
        this.accessToken = token;
        this.token = token;
        this.expiresIn = 900;
        this.user = user;
    }

    public AuthResponse(boolean success, String message, String accessToken, String refreshToken, long expiresIn, UserSummaryDto user) {
        this.success = success;
        this.message = message;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.token = accessToken;
        this.expiresIn = expiresIn;
        this.tokenType = "Bearer";
        this.user = user;
    }

    public static AuthResponse error(String message) {
        AuthResponse response = new AuthResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }

    public static AuthResponse error(String message, String errorCode) {
        AuthResponse response = new AuthResponse();
        response.setSuccess(false);
        response.setMessage(message);
        response.setErrorCode(errorCode);
        return response;
    }

    public static AuthResponse success(String message) {
        return new AuthResponse(true, message);
    }

    public static AuthResponse success(String message, String token, UserSummaryDto user) {
        return new AuthResponse(true, message, token, user);
    }

    public static AuthResponse success(String message, String accessToken, String refreshToken, long expiresIn, UserSummaryDto user) {
        return new AuthResponse(true, message, accessToken, refreshToken, expiresIn, user);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
        if (this.token == null) {
            this.token = accessToken;
        }
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getToken() {
        return token != null ? token : accessToken;
    }

    public void setToken(String token) {
        this.token = token;
        if (this.accessToken == null) {
            this.accessToken = token;
        }
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserSummaryDto getUser() {
        return user;
    }

    public void setUser(UserSummaryDto user) {
        this.user = user;
    }
}
