package com.example.social_issues.universitycollab.dto;

import java.util.HashMap;
import java.util.Map;

public class AccreditationReportDto {

    private String institutionName;
    private String aisheCode;
    private int totalProjects;
    private int completedDeployments;
    private int activePrototypes;
    private int totalCommunityHours;
    private int totalAbcCreditsDisbursed;
    private int totalCitizenBeneficiaries;
    private int participatingStudentsCount;
    private int participatingFacultyCount;
    private String naacCriteriaScore;
    private String nirfRankContribution;
    private Map<String, Integer> sdgBreakdown = new HashMap<>();

    public AccreditationReportDto() {}

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getAisheCode() { return aisheCode; }
    public void setAisheCode(String aisheCode) { this.aisheCode = aisheCode; }

    public int getTotalProjects() { return totalProjects; }
    public void setTotalProjects(int totalProjects) { this.totalProjects = totalProjects; }

    public int getCompletedDeployments() { return completedDeployments; }
    public void setCompletedDeployments(int completedDeployments) { this.completedDeployments = completedDeployments; }

    public int getActivePrototypes() { return activePrototypes; }
    public void setActivePrototypes(int activePrototypes) { this.activePrototypes = activePrototypes; }

    public int getTotalCommunityHours() { return totalCommunityHours; }
    public void setTotalCommunityHours(int totalCommunityHours) { this.totalCommunityHours = totalCommunityHours; }

    public int getTotalAbcCreditsDisbursed() { return totalAbcCreditsDisbursed; }
    public void setTotalAbcCreditsDisbursed(int totalAbcCreditsDisbursed) { this.totalAbcCreditsDisbursed = totalAbcCreditsDisbursed; }

    public int getTotalCitizenBeneficiaries() { return totalCitizenBeneficiaries; }
    public void setTotalCitizenBeneficiaries(int totalCitizenBeneficiaries) { this.totalCitizenBeneficiaries = totalCitizenBeneficiaries; }

    public int getParticipatingStudentsCount() { return participatingStudentsCount; }
    public void setParticipatingStudentsCount(int participatingStudentsCount) { this.participatingStudentsCount = participatingStudentsCount; }

    public int getParticipatingFacultyCount() { return participatingFacultyCount; }
    public void setParticipatingFacultyCount(int participatingFacultyCount) { this.participatingFacultyCount = participatingFacultyCount; }

    public String getNaacCriteriaScore() { return naacCriteriaScore; }
    public void setNaacCriteriaScore(String naacCriteriaScore) { this.naacCriteriaScore = naacCriteriaScore; }

    public String getNirfRankContribution() { return nirfRankContribution; }
    public void setNirfRankContribution(String nirfRankContribution) { this.nirfRankContribution = nirfRankContribution; }

    public Map<String, Integer> getSdgBreakdown() { return sdgBreakdown; }
    public void setSdgBreakdown(Map<String, Integer> sdgBreakdown) { this.sdgBreakdown = sdgBreakdown; }
}
