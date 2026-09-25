package com.example.social_issues.routing.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class TriageAssignRequest {

    @JsonAlias({"assignedHEI", "assigned_hei", "university"})
    private String heiName;

    @JsonAlias({"aishe_code", "aisheCode"})
    private String aisheCode;

    private String notes;

    @JsonAlias({"allocated_grant", "allocatedGrant"})
    private java.math.BigDecimal allocatedGrant;

    public TriageAssignRequest() {}

    public TriageAssignRequest(String heiName, String notes) {
        this.heiName = heiName;
        this.notes = notes;
    }

    public TriageAssignRequest(String heiName, String aisheCode, String notes, java.math.BigDecimal allocatedGrant) {
        this.heiName = heiName;
        this.aisheCode = aisheCode;
        this.notes = notes;
        this.allocatedGrant = allocatedGrant;
    }

    public String getHeiName() {
        return heiName;
    }

    public void setHeiName(String heiName) {
        this.heiName = heiName;
    }

    public String getAisheCode() {
        return aisheCode;
    }

    public void setAisheCode(String aisheCode) {
        this.aisheCode = aisheCode;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public java.math.BigDecimal getAllocatedGrant() {
        return allocatedGrant;
    }

    public void setAllocatedGrant(java.math.BigDecimal allocatedGrant) {
        this.allocatedGrant = allocatedGrant;
    }
}
