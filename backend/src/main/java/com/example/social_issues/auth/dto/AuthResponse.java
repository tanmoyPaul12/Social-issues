package com.example.social_issues.auth.dto;

public class AuthResponse {

    private boolean success;
    private String message;
    private String errorCode;
    private String token;
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
        this.token = token;
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

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserSummaryDto getUser() {
        return user;
    }

    public void setUser(UserSummaryDto user) {
        this.user = user;
    }
}
