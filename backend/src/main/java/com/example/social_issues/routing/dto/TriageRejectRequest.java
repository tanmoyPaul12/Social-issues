package com.example.social_issues.routing.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class TriageRejectRequest {

    @JsonAlias({"rejectionReason", "notes", "comment"})
    private String reason;

    public TriageRejectRequest() {}

    public TriageRejectRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
