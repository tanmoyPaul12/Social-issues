package com.example.social_issues.industrypartnership.dto;

import com.example.social_issues.industrypartnership.model.CsrAuditTrail;
import java.time.LocalDateTime;

public class CsrAuditTrailDto {

    private Long id;
    private String financialYear;
    private String actionType;
    private String actionTitle;
    private String detailsJson;
    private String actorName;
    private String actorRole;
    private String entityType;
    private Long entityId;
    private String previousHash;
    private String hashSha256;
    private LocalDateTime timestamp;

    public CsrAuditTrailDto() {}

    public static CsrAuditTrailDto fromEntity(CsrAuditTrail a) {
        CsrAuditTrailDto dto = new CsrAuditTrailDto();
        dto.setId(a.getId());
        dto.setFinancialYear(a.getFinancialYear());
        dto.setActionType(a.getActionType());
        dto.setActionTitle(a.getActionTitle());
        dto.setDetailsJson(a.getDetailsJson());
        dto.setActorName(a.getActorName());
        dto.setActorRole(a.getActorRole());
        dto.setEntityType(a.getEntityType());
        dto.setEntityId(a.getEntityId());
        dto.setPreviousHash(a.getPreviousHash());
        dto.setHashSha256(a.getHashSha256());
        dto.setTimestamp(a.getTimestamp());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getActionTitle() { return actionTitle; }
    public void setActionTitle(String actionTitle) { this.actionTitle = actionTitle; }

    public String getDetailsJson() { return detailsJson; }
    public void setDetailsJson(String detailsJson) { this.detailsJson = detailsJson; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public String getHashSha256() { return hashSha256; }
    public void setHashSha256(String hashSha256) { this.hashSha256 = hashSha256; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
