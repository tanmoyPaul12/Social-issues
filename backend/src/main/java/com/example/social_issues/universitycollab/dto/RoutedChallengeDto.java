package com.example.social_issues.universitycollab.dto;

import com.example.social_issues.problemsubmission.model.GrassrootIssue;

import java.time.LocalDateTime;

public class RoutedChallengeDto {

    private Long id;
    private String ticketId;
    private String title;
    private String description;
    private String domain;
    private String sector;
    private String district;
    private String block;
    private String urgency;
    private String matchScore;
    private String problemSnippet;
    private Integer affectedPopulation;
    private String status;
    private LocalDateTime createdAt;

    public RoutedChallengeDto() {}

    public static RoutedChallengeDto fromIssue(GrassrootIssue issue, String matchScore) {
        RoutedChallengeDto dto = new RoutedChallengeDto();
        dto.setId(issue.getId());
        dto.setTicketId(issue.getIssueNumber());
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setSector(issue.getSector() != null ? issue.getSector().name() : "OTHER");
        dto.setDomain(issue.getSector() != null ? issue.getSector().name() : "General Need");
        dto.setDistrict(issue.getDistrict());
        dto.setBlock(issue.getBlock());
        dto.setUrgency(issue.getPriority() != null ? issue.getPriority().name() : "MEDIUM");
        dto.setMatchScore(matchScore != null ? matchScore : "94% AI Match");
        
        String desc = issue.getDescription() != null ? issue.getDescription() : "";
        dto.setProblemSnippet(desc.length() > 160 ? desc.substring(0, 157) + "..." : desc);
        dto.setAffectedPopulation(issue.getAffectedPopulation());
        dto.setStatus(issue.getStatus() != null ? issue.getStatus().name() : "SUBMITTED");
        dto.setCreatedAt(issue.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getMatchScore() { return matchScore; }
    public void setMatchScore(String matchScore) { this.matchScore = matchScore; }

    public String getProblemSnippet() { return problemSnippet; }
    public void setProblemSnippet(String problemSnippet) { this.problemSnippet = problemSnippet; }

    public Integer getAffectedPopulation() { return affectedPopulation; }
    public void setAffectedPopulation(Integer affectedPopulation) { this.affectedPopulation = affectedPopulation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
