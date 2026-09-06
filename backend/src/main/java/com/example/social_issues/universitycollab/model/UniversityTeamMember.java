package com.example.social_issues.universitycollab.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "university_team_members", indexes = {
    @Index(name = "idx_team_project_id", columnList = "project_id"),
    @Index(name = "idx_team_role", columnList = "role")
})
public class UniversityTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private UniversityProject project;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private TeamMemberRole role = TeamMemberRole.STUDENT_INNOVATOR;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "identifier", length = 80) // Employee ID or Student Roll No
    private String identifier;

    @Column(name = "department", length = 120)
    private String department;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "year_or_designation", length = 100)
    private String yearOrDesignation;

    @Column(name = "abc_credits") // NEP 2020 Academic Bank of Credits
    private Integer abcCredits = 4;

    @Column(name = "is_lead")
    private Boolean isLead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public UniversityTeamMember() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UniversityProject getProject() { return project; }
    public void setProject(UniversityProject project) { this.project = project; }

    public TeamMemberRole getRole() { return role; }
    public void setRole(TeamMemberRole role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getYearOrDesignation() { return yearOrDesignation; }
    public void setYearOrDesignation(String yearOrDesignation) { this.yearOrDesignation = yearOrDesignation; }

    public Integer getAbcCredits() { return abcCredits; }
    public void setAbcCredits(Integer abcCredits) { this.abcCredits = abcCredits; }

    public Boolean getIsLead() { return isLead; }
    public void setIsLead(Boolean isLead) { this.isLead = isLead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
