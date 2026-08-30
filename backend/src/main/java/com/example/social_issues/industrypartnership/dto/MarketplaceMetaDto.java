package com.example.social_issues.industrypartnership.dto;

import java.util.List;
import java.util.Map;

public class MarketplaceMetaDto {

    private long totalPublishedProjects;
    private List<String> availableUniversities;
    private Map<String, Long> sectorCounts;
    private Map<String, Long> stageCounts;

    public MarketplaceMetaDto() {}

    public MarketplaceMetaDto(long totalPublishedProjects, List<String> availableUniversities, Map<String, Long> sectorCounts, Map<String, Long> stageCounts) {
        this.totalPublishedProjects = totalPublishedProjects;
        this.availableUniversities = availableUniversities;
        this.sectorCounts = sectorCounts;
        this.stageCounts = stageCounts;
    }

    public long getTotalPublishedProjects() { return totalPublishedProjects; }
    public void setTotalPublishedProjects(long totalPublishedProjects) { this.totalPublishedProjects = totalPublishedProjects; }

    public List<String> getAvailableUniversities() { return availableUniversities; }
    public void setAvailableUniversities(List<String> availableUniversities) { this.availableUniversities = availableUniversities; }

    public Map<String, Long> getSectorCounts() { return sectorCounts; }
    public void setSectorCounts(Map<String, Long> sectorCounts) { this.sectorCounts = sectorCounts; }

    public Map<String, Long> getStageCounts() { return stageCounts; }
    public void setStageCounts(Map<String, Long> stageCounts) { this.stageCounts = stageCounts; }
}
