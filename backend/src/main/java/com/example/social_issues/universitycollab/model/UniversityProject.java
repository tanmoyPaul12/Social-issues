package com.example.social_issues.universitycollab.model;

import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "university_projects", indexes = {
    @Index(name = "idx_uni_proj_aishe", columnList = "aishe_code"),
    @Index(name = "idx_uni_proj_stage", columnList = "stage"),
    @Index(name = "idx_uni_proj_issue_id", columnList = "issue_id")
})
public class UniversityProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "project_code", unique = true, nullable = false, length = 60)
    private String projectCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id")
    private GrassrootIssue issue;

    @Column(name = "ticket_id", length = 60)
    private String ticketId;

    @Column(name = "aishe_code", nullable = false, length = 60)
    private String aisheCode;

    @Column(name = "university_name", nullable = false, length = 250)
    private String universityName;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "abstract_description", columnDefinition = "TEXT")
    private String abstractDescription;

    @Column(name = "domain", length = 100)
    private String domain;

    @Column(name = "district", length = 100)
    private String district;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 50)
    private UniversityProjectStage stage = UniversityProjectStage.TEAM_FORMATION;

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 20;

    @Column(name = "lead_faculty_mentor", length = 200)
    private String leadFacultyMentor;

    @Column(name = "lead_student_innovator", length = 200)
    private String leadStudentInnovator;

    @Column(name = "allocated_grant", precision = 15, scale = 2)
    private BigDecimal allocatedGrant = BigDecimal.valueOf(200000); // e.g. 2 Lakhs default

    @Column(name = "csr_partner", length = 200)
    private String csrPartner = "State Innovation Fund";

    @Column(name = "current_milestone", length = 400)
    private String currentMilestone = "Project team formed; preparing technical prototype roadmap.";

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UniversityTeamMember> teamMembers = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UniversityProject() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public GrassrootIssue getIssue() { return issue; }
    public void setIssue(GrassrootIssue issue) { this.issue = issue; }

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

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getLeadFacultyMentor() { return leadFacultyMentor; }
    public void setLeadFacultyMentor(String leadFacultyMentor) { this.leadFacultyMentor = leadFacultyMentor; }

    public String getLeadStudentInnovator() { return leadStudentInnovator; }
    public void setLeadStudentInnovator(String leadStudentInnovator) { this.leadStudentInnovator = leadStudentInnovator; }

    public BigDecimal getAllocatedGrant() { return allocatedGrant; }
    public void setAllocatedGrant(BigDecimal allocatedGrant) { this.allocatedGrant = allocatedGrant; }

    public String getCsrPartner() { return csrPartner; }
    public void setCsrPartner(String csrPartner) { this.csrPartner = csrPartner; }

    public String getCurrentMilestone() { return currentMilestone; }
    public void setCurrentMilestone(String currentMilestone) { this.currentMilestone = currentMilestone; }

    public List<UniversityTeamMember> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<UniversityTeamMember> teamMembers) { this.teamMembers = teamMembers; }

    public void addTeamMember(UniversityTeamMember member) {
        teamMembers.add(member);
        member.setProject(this);
    }

    public void removeTeamMember(UniversityTeamMember member) {
        teamMembers.remove(member);
        member.setProject(null);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
