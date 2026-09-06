package com.example.social_issues.universitycollab.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CreateUniversityProjectRequest {

    private Long issueId;

    private String ticketId;

    @NotBlank(message = "AISHE code is required")
    private String aisheCode;

    private String universityName;

    @NotBlank(message = "Project title is required")
    private String title;

    private String abstractDescription;

    private String domain;

    private String district;

    private String leadFacultyMentor;

    private String leadStudentInnovator;

    private BigDecimal allocatedGrant;

    private String csrPartner;

    private String milestoneDesc;

    private List<TeamMemberDto> teamMembers = new ArrayList<>();

    public CreateUniversityProjectRequest() {}

    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getAisheCode() { return aisheCode; }
    public void setAisheCode(String aisheCode) { this.aisheCode = aisheCode; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractDescription() { return abstractDescription; }
    public void setAbstractDescription(String abstractDescription) { this.abstractDescription = abstractDescription; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getLeadFacultyMentor() { return leadFacultyMentor; }
    public void setLeadFacultyMentor(String leadFacultyMentor) { this.leadFacultyMentor = leadFacultyMentor; }

    public String getLeadStudentInnovator() { return leadStudentInnovator; }
    public void setLeadStudentInnovator(String leadStudentInnovator) { this.leadStudentInnovator = leadStudentInnovator; }

    public BigDecimal getAllocatedGrant() { return allocatedGrant; }
    public void setAllocatedGrant(BigDecimal allocatedGrant) { this.allocatedGrant = allocatedGrant; }

    public String getCsrPartner() { return csrPartner; }
    public void setCsrPartner(String csrPartner) { this.csrPartner = csrPartner; }

    public String getMilestoneDesc() { return milestoneDesc; }
    public void setMilestoneDesc(String milestoneDesc) { this.milestoneDesc = milestoneDesc; }

    public List<TeamMemberDto> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<TeamMemberDto> teamMembers) { this.teamMembers = teamMembers; }
}
