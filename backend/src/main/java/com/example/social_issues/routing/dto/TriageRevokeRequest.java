package com.example.social_issues.routing.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class TriageRevokeRequest {

    @JsonAlias({"reason", "revocationReason", "revocation_reason", "notes"})
    private String reason;

    public TriageRevokeRequest() {}

    public TriageRevokeRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
