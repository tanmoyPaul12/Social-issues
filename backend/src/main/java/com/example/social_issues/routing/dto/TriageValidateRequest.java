package com.example.social_issues.routing.dto;

public class TriageValidateRequest {

    private String notes;

    public TriageValidateRequest() {}

    public TriageValidateRequest(String notes) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
