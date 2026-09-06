package com.example.social_issues.universitycollab.dto;

import com.example.social_issues.universitycollab.model.TeamMemberRole;

public class TeamMemberDto {
    private Long id;
    private TeamMemberRole role;
    private String name;
    private String identifier;
    private String department;
    private String email;
    private String phone;
    private String yearOrDesignation;
    private Integer abcCredits;
    private Boolean isLead;

    public TeamMemberDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
}
