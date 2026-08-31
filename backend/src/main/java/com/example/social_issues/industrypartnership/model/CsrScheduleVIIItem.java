package com.example.social_issues.industrypartnership.model;

public enum CsrScheduleVIIItem {
    ITEM_IX_PUBLIC_HEI_INCUBATOR(
            "Item (ix)",
            "Contribution to public funded universities, IITs, national labs, autonomous bodies, and technology incubators"
    ),
    ITEM_II_EDUCATION_SKILLING(
            "Item (ii)",
            "Promoting education, vocational skills, livelihood enhancement, and special education projects"
    ),
    ITEM_I_HEALTH_SANITATION(
            "Item (i)",
            "Eradicating hunger, poverty, malnutrition, promoting health care, sanitation, and safe drinking water"
    ),
    ITEM_IV_ENVIRONMENT_ECOLOGY(
            "Item (iv)",
            "Ensuring environmental sustainability, ecological balance, flora & fauna conservation, agroforestry"
    ),
    ITEM_VII_HERITAGE_ART(
            "Item (vii)",
            "Protection of national heritage, art and culture, setting up public libraries, promotion of traditional arts"
    ),
    ITEM_VIII_ARMED_FORCES(
            "Item (viii)",
            "Measures for the benefit of armed forces veterans, war widows and their dependents"
    ),
    ITEM_X_RURAL_DEVELOPMENT(
            "Item (x)",
            "Rural development projects and tribal community infrastructure enhancement"
    ),
    ITEM_XII_DISASTER_MANAGEMENT(
            "Item (xii)",
            "Disaster management, including relief, rehabilitation, and reconstruction activities"
    ),
    OTHER_APPROVED_ACTIVITY(
            "Other",
            "Other permitted activities as notified by the Ministry of Corporate Affairs (MCA)"
    );

    private final String itemCode;
    private final String description;

    CsrScheduleVIIItem(String itemCode, String description) {
        this.itemCode = itemCode;
        this.description = description;
    }

    public String getItemCode() {
        return itemCode;
    }

    public String getDescription() {
        return description;
    }
}
