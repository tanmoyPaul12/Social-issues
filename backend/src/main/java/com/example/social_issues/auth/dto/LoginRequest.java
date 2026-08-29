package com.example.social_issues.auth.dto;

public class LoginRequest {

    private String email;
    private String identifier;
    private String phone;
    private String password;
    private String otp;
    private String loginType = "password"; // "password" or "otp"
    private boolean rememberMe = false;
    private String portalRole; // "UNIVERSITY", "INDUSTRY", "GOVERNMENT", "CITIZEN", "ADMIN"

    public LoginRequest() {
    }

    public String getPortalRole() {
        return portalRole;
    }

    public void setPortalRole(String portalRole) {
        this.portalRole = portalRole;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isRememberMe() {
        return rememberMe;
    }

    public void setRememberMe(boolean rememberMe) {
        this.rememberMe = rememberMe;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getLoginType() {
        return loginType;
    }

    public void setLoginType(String loginType) {
        this.loginType = loginType;
    }
}
