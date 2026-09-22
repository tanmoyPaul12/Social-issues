package com.example.social_issues.industryproposal.dto;

public class PublishIssueRequest {

    private String collegeCustomNotes;
    private String guidelineDocUrl;
    private String guidelineDocName;

    public PublishIssueRequest() {}

    public PublishIssueRequest(String collegeCustomNotes, String guidelineDocUrl, String guidelineDocName) {
        this.collegeCustomNotes = collegeCustomNotes;
        this.guidelineDocUrl = guidelineDocUrl;
        this.guidelineDocName = guidelineDocName;
    }

    public String getCollegeCustomNotes() { return collegeCustomNotes; }
    public void setCollegeCustomNotes(String collegeCustomNotes) { this.collegeCustomNotes = collegeCustomNotes; }

    public String getGuidelineDocUrl() { return guidelineDocUrl; }
    public void setGuidelineDocUrl(String guidelineDocUrl) { this.guidelineDocUrl = guidelineDocUrl; }

    public String getGuidelineDocName() { return guidelineDocName; }
    public void setGuidelineDocName(String guidelineDocName) { this.guidelineDocName = guidelineDocName; }
}
