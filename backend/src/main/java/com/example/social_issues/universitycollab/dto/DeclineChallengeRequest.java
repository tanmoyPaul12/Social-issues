package com.example.social_issues.universitycollab.dto;

public class DeclineChallengeRequest {

    private String reason;

    public DeclineChallengeRequest() {}

    public DeclineChallengeRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
