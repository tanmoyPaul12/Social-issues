package com.example.social_issues.industrypartnership.model;

public enum CorporateRole {
    CSR_ADMIN("Corporate Administrator — Full Control"),
    FINANCE_APPROVER("Finance & Disbursements Approver — Grants & Tranches"),
    PROJECT_MANAGER("R&D Pilot Manager — Milestones & Discussions"),
    CSR_VIEWER("Auditor / Observer — Read-Only Access");

    private final String description;

    CorporateRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
