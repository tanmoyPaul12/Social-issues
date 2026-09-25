package com.example.social_issues.analytics.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DistrictReportRowDto {

    private String district;
    private long challengesSubmitted;
    private long challengesTriaged;
    private long challengesAssignedHEI;
    private long challengesResolved;
    private double resolutionRate;

    private long activeProjects;
    private long completedProjects;
    private double avgTrlLevel;
    private int highestTrl;

    private long patentsFiled;
    private long patentsGranted;
    private BigDecimal csrFundsAllocatedInr = BigDecimal.ZERO;

    private List<String> participatingUniversities = new ArrayList<>();
    private String topDomainNeed;

    public DistrictReportRowDto() {}

    public DistrictReportRowDto(String district) {
        this.district = district;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public long getChallengesSubmitted() {
        return challengesSubmitted;
    }

    public void setChallengesSubmitted(long challengesSubmitted) {
        this.challengesSubmitted = challengesSubmitted;
    }

    public long getChallengesTriaged() {
        return challengesTriaged;
    }

    public void setChallengesTriaged(long challengesTriaged) {
        this.challengesTriaged = challengesTriaged;
    }

    public long getChallengesAssignedHEI() {
        return challengesAssignedHEI;
    }

    public void setChallengesAssignedHEI(long challengesAssignedHEI) {
        this.challengesAssignedHEI = challengesAssignedHEI;
    }

    public long getChallengesResolved() {
        return challengesResolved;
    }

    public void setChallengesResolved(long challengesResolved) {
        this.challengesResolved = challengesResolved;
    }

    public double getResolutionRate() {
        return resolutionRate;
    }

    public void setResolutionRate(double resolutionRate) {
        this.resolutionRate = resolutionRate;
    }

    public long getActiveProjects() {
        return activeProjects;
    }

    public void setActiveProjects(long activeProjects) {
        this.activeProjects = activeProjects;
    }

    public long getCompletedProjects() {
        return completedProjects;
    }

    public void setCompletedProjects(long completedProjects) {
        this.completedProjects = completedProjects;
    }

    public double getAvgTrlLevel() {
        return avgTrlLevel;
    }

    public void setAvgTrlLevel(double avgTrlLevel) {
        this.avgTrlLevel = avgTrlLevel;
    }

    public int getHighestTrl() {
        return highestTrl;
    }

    public void setHighestTrl(int highestTrl) {
        this.highestTrl = highestTrl;
    }

    public long getPatentsFiled() {
        return patentsFiled;
    }

    public void setPatentsFiled(long patentsFiled) {
        this.patentsFiled = patentsFiled;
    }

    public long getPatentsGranted() {
        return patentsGranted;
    }

    public void setPatentsGranted(long patentsGranted) {
        this.patentsGranted = patentsGranted;
    }

    public BigDecimal getCsrFundsAllocatedInr() {
        return csrFundsAllocatedInr;
    }

    public void setCsrFundsAllocatedInr(BigDecimal csrFundsAllocatedInr) {
        this.csrFundsAllocatedInr = csrFundsAllocatedInr;
    }

    public List<String> getParticipatingUniversities() {
        return participatingUniversities;
    }

    public void setParticipatingUniversities(List<String> participatingUniversities) {
        this.participatingUniversities = participatingUniversities;
    }

    public String getTopDomainNeed() {
        return topDomainNeed;
    }

    public void setTopDomainNeed(String topDomainNeed) {
        this.topDomainNeed = topDomainNeed;
    }
}
