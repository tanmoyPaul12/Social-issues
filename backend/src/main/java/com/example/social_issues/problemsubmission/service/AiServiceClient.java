package com.example.social_issues.problemsubmission.service;

import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public AiServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Executes 4-modality weighted generalization and priority consensus via FastAPI AI service.
     */
    public Map<String, Object> processMultimodalIntelligence(GrassrootIssue issue, Map<String, Object> docAnalysis, Map<String, Object> imgAnalysis) {
        try {
            String endpoint = aiServiceUrl + "/api/v1/intelligence/process";

            Map<String, Object> payload = new HashMap<>();
            payload.put("issue_id", issue.getIssueNumber());

            // 1. Text Modality Data
            Map<String, Object> textData = new HashMap<>();
            textData.put("title", issue.getTitle() != null ? issue.getTitle() : "");
            textData.put("description", issue.getDescription() != null ? issue.getDescription() : "");
            textData.put("combined_english_text", (issue.getTitle() + ". " + issue.getDescription()).trim());
            payload.put("text", textData);

            // 2. Image Modality Data
            if (imgAnalysis != null && !imgAnalysis.isEmpty()) {
                payload.put("image", imgAnalysis);
            }

            // 3. Document Modality Data
            if (docAnalysis != null && !docAnalysis.isEmpty()) {
                payload.put("document", docAnalysis);
            }

            // 4. Location Modality Data
            Map<String, Object> locData = new HashMap<>();
            locData.put("latitude", issue.getLatitude());
            locData.put("longitude", issue.getLongitude());
            locData.put("district", issue.getDistrict() != null ? issue.getDistrict() : "Unknown");
            locData.put("block", issue.getBlock());
            payload.put("location", locData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            Map<String, Object> response = restTemplate.postForObject(endpoint, requestEntity, Map.class);
            
            if (response != null && response.containsKey("data")) {
                return (Map<String, Object>) response.get("data");
            }
            return response;
        } catch (Exception e) {
            log.warn("AI Service call failed (fallback active): {}", e.getMessage());
            return generateFallbackAudit(issue);
        }
    }

    private Map<String, Object> generateFallbackAudit(GrassrootIssue issue) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("issue_id", issue.getIssueNumber());

        Map<String, Object> modality = new HashMap<>();
        modality.put("text_analysis", Map.of("category", issue.getSector() != null ? issue.getSector().name() : "OTHER", "priority_score", 50));
        modality.put("image_analysis", Map.of("category", issue.getSector() != null ? issue.getSector().name() : "OTHER", "priority_score", 50));
        modality.put("document_analysis", Map.of("category", issue.getSector() != null ? issue.getSector().name() : "OTHER", "priority_score", 50));
        modality.put("location_analysis", Map.of("is_valid", true, "district", issue.getDistrict() != null ? issue.getDistrict() : "Unknown", "urgency_bonus", 10));

        fallback.put("modality_breakdown", modality);
        fallback.put("generalized_consensus", Map.of(
            "final_category", issue.getSector() != null ? issue.getSector().name() : "OTHER",
            "average_priority_score", 60,
            "final_priority_level", issue.getPriority() != null ? issue.getPriority().name() : "MEDIUM",
            "consensus_reason", "Fallback deterministic rule applied (AI service unreachable)."
        ));
        return fallback;
    }
}
