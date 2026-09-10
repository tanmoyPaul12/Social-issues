package com.example.social_issues.universitycollab.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CitizenVerificationRequest {

    @NotNull(message = "Citizen rating is required")
    @DecimalMin(value = "1.0", message = "Minimum rating is 1.0")
    @DecimalMax(value = "5.0", message = "Maximum rating is 5.0")
    private Double citizenRating;

    @NotBlank(message = "Citizen feedback is required")
    private String feedback;

    private String proofImageUrl;

    private String verifiedByCitizenName;

    public CitizenVerificationRequest() {}

    public Double getCitizenRating() { return citizenRating; }
    public void setCitizenRating(Double citizenRating) { this.citizenRating = citizenRating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getProofImageUrl() { return proofImageUrl; }
    public void setProofImageUrl(String proofImageUrl) { this.proofImageUrl = proofImageUrl; }

    public String getVerifiedByCitizenName() { return verifiedByCitizenName; }
    public void setVerifiedByCitizenName(String verifiedByCitizenName) { this.verifiedByCitizenName = verifiedByCitizenName; }
}
