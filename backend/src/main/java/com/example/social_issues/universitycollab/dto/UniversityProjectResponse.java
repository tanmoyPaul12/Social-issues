package com.example.social_issues.universitycollab.dto;

import com.example.social_issues.universitycollab.model.UniversityProject;
import com.example.social_issues.universitycollab.model.UniversityProjectStage;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class UniversityProjectResponse {

    private Long id;
    private String projectCode;
    private Long issueId;
    private String ticketId;
    private String aisheCode;
    private String universityName;
    private String title;
    private String abstractDescription;
    private String domain;
    private String district;
    private UniversityProjectStage stage;
    private Integer progress;
    private String facultyMentor;
    private String studentLead;
    private BigDecimal grantFunded;
    private String csrPartner;
    private String milestoneDesc;
    private List<TeamMemberDto> teamMembers = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UniversityProjectResponse() {}

    public static UniversityProjectResponse fromEntity(UniversityProject entity) {
        UniversityProjectResponse res = new UniversityProjectResponse();
        res.setId(entity.getId());
        res.setProjectCode(entity.getProjectCode());
        res.setIssueId(entity.getIssue() != null ? entity.getIssue().getId() : null);
        res.setTicketId(entity.getTicketId() != null ? entity.getTicketId() : (entity.getIssue() != null ? entity.getIssue().getIssueNumber() : null));
        res.setAisheCode(entity.getAisheCode());
        res.setUniversityName(entity.getUniversityName());
        res.setTitle(entity.getTitle());
        res.setAbstractDescription(entity.getAbstractDescription());
        res.setDomain(entity.getDomain());
        res.setDistrict(entity.getDistrict());
        res.setStage(entity.getStage());
        res.setProgress(entity.getProgressPercentage());
        res.setFacultyMentor(entity.getLeadFacultyMentor());
        res.setStudentLead(entity.getLeadStudentInnovator());
        res.setGrantFunded(entity.getAllocatedGrant());
        res.setCsrPartner(entity.getCsrPartner());
        res.setMilestoneDesc(entity.getCurrentMilestone());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getTeamMembers() != null) {
            res.setTeamMembers(entity.getTeamMembers().stream().map(m -> {
                TeamMemberDto dto = new TeamMemberDto();
                dto.setId(m.getId());
                dto.setRole(m.getRole());
                dto.setName(m.getName());
                dto.setIdentifier(m.getIdentifier());
                dto.setDepartment(m.getDepartment());
                dto.setEmail(m.getEmail());
                dto.setPhone(m.getPhone());
                dto.setYearOrDesignation(m.getYearOrDesignation());
                dto.setAbcCredits(m.getAbcCredits());
                dto.setIsLead(m.getIsLead());
                return dto;
            }).collect(Collectors.toList()));
        }

        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

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

    public UniversityProjectStage getStage() { return stage; }
    public void setStage(UniversityProjectStage stage) { this.stage = stage; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public String getFacultyMentor() { return facultyMentor; }
    public void setFacultyMentor(String facultyMentor) { this.facultyMentor = facultyMentor; }

    public String getStudentLead() { return studentLead; }
    public void setStudentLead(String studentLead) { this.studentLead = studentLead; }

    public BigDecimal getGrantFunded() { return grantFunded; }
    public void setGrantFunded(BigDecimal grantFunded) { this.grantFunded = grantFunded; }

    public String getCsrPartner() { return csrPartner; }
    public void setCsrPartner(String csrPartner) { this.csrPartner = csrPartner; }

    public String getMilestoneDesc() { return milestoneDesc; }
    public void setMilestoneDesc(String milestoneDesc) { this.milestoneDesc = milestoneDesc; }

    public List<TeamMemberDto> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<TeamMemberDto> teamMembers) { this.teamMembers = teamMembers; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
