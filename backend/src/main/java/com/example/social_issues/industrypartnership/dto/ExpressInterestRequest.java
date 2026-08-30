package com.example.social_issues.industrypartnership.dto;

public class ExpressInterestRequest {

    private String contactPersonName;
    private String contactEmail;
    private String messageNotes;
    private String pilotInterestScope;

    public ExpressInterestRequest() {}

    public String getContactPersonName() { return contactPersonName; }
    public void setContactPersonName(String contactPersonName) { this.contactPersonName = contactPersonName; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getMessageNotes() { return messageNotes; }
    public void setMessageNotes(String messageNotes) { this.messageNotes = messageNotes; }

    public String getPilotInterestScope() { return pilotInterestScope; }
    public void setPilotInterestScope(String pilotInterestScope) { this.pilotInterestScope = pilotInterestScope; }
}
