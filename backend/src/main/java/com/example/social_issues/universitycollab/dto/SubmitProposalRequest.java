package com.example.social_issues.universitycollab.dto;

import java.math.BigDecimal;

public class SubmitProposalRequest {

    private String title;
    private String abstractDescription;
    private String domain;
    private BigDecimal allocatedGrant;
    private Integer estimatedTimelineMonths;
    private String methodology;

    public SubmitProposalRequest() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAbstractDescription() {
        return abstractDescription;
    }

    public void setAbstractDescription(String abstractDescription) {
        this.abstractDescription = abstractDescription;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public BigDecimal getAllocatedGrant() {
        return allocatedGrant;
    }

    public void setAllocatedGrant(BigDecimal allocatedGrant) {
        this.allocatedGrant = allocatedGrant;
    }

    public Integer getEstimatedTimelineMonths() {
        return estimatedTimelineMonths;
    }

    public void setEstimatedTimelineMonths(Integer estimatedTimelineMonths) {
        this.estimatedTimelineMonths = estimatedTimelineMonths;
    }

    public String getMethodology() {
        return methodology;
    }

    public void setMethodology(String methodology) {
        this.methodology = methodology;
    }
}
