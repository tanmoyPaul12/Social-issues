package com.example.social_issues.problemsubmission.model;

public enum IssueSector {
    WATER,
    HEALTH,
    EDUCATION,
    INFRASTRUCTURE,
    AGRICULTURE,
    ELECTRICITY,
    SANITATION,
    LIVELIHOOD,
    ENVIRONMENT,
    GOVERNANCE,
    OTHER;

    public String getDisplayName() {
        String n = name();
        return n.substring(0, 1).toUpperCase() + n.substring(1).toLowerCase();
    }
}
