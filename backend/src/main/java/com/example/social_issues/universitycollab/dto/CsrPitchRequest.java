package com.example.social_issues.universitycollab.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CsrPitchRequest {

    @NotNull(message = "Requested grant amount is required")
    @DecimalMin(value = "5000.00", message = "Minimum grant request is Rs 5,000")
    private BigDecimal requestedAmount;

    @NotBlank(message = "Pitch description is required")
    private String pitchDescription;

    private String mentorNeeds;

    private String targetSponsorCompany;

    public CsrPitchRequest() {}

    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }

    public String getPitchDescription() { return pitchDescription; }
    public void setPitchDescription(String pitchDescription) { this.pitchDescription = pitchDescription; }

    public String getMentorNeeds() { return mentorNeeds; }
    public void setMentorNeeds(String mentorNeeds) { this.mentorNeeds = mentorNeeds; }

    public String getTargetSponsorCompany() { return targetSponsorCompany; }
    public void setTargetSponsorCompany(String targetSponsorCompany) { this.targetSponsorCompany = targetSponsorCompany; }
}
