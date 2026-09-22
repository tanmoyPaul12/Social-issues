package com.example.social_issues.routing.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class TriageAssignRequest {

    @JsonAlias({"assignedHEI", "assigned_hei", "university"})
    private String heiName;

    private String notes;

    public TriageAssignRequest() {}

    public TriageAssignRequest(String heiName, String notes) {
        this.heiName = heiName;
        this.notes = notes;
    }

    public String getHeiName() {
        return heiName;
    }

    public void setHeiName(String heiName) {
        this.heiName = heiName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
