package com.example.social_issues.industrypartnership.dto;

import jakarta.validation.constraints.NotBlank;

public class AcceptInvitationRequest {

    @NotBlank(message = "Invitation token is required")
    private String token;

    public AcceptInvitationRequest() {}

    public AcceptInvitationRequest(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
