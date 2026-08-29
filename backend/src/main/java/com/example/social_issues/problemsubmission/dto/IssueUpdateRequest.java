package com.example.social_issues.problemsubmission.dto;

import com.example.social_issues.problemsubmission.model.IssuePriority;
import com.example.social_issues.problemsubmission.model.IssueSector;
import jakarta.validation.constraints.Size;

public class IssueUpdateRequest {

    @Size(max = 300, message = "Title cannot exceed 300 characters")
    private String title;

    private String description;

    private IssueSector sector;

    private String district;

    private String block;

    private String villageOrWard;

    private Double latitude;

    private Double longitude;

    private String addressDescription;

    private Integer affectedPopulation;

    private String contactName;

    private String contactPhone;

    private Boolean isAnonymous;

    private IssuePriority priority;

    public IssueUpdateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public IssueSector getSector() { return sector; }
    public void setSector(IssueSector sector) { this.sector = sector; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getVillageOrWard() { return villageOrWard; }
    public void setVillageOrWard(String villageOrWard) { this.villageOrWard = villageOrWard; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }

    public Integer getAffectedPopulation() { return affectedPopulation; }
    public void setAffectedPopulation(Integer affectedPopulation) { this.affectedPopulation = affectedPopulation; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean anonymous) { isAnonymous = anonymous; }

    public IssuePriority getPriority() { return priority; }
    public void setPriority(IssuePriority priority) { this.priority = priority; }
}
