package com.example.social_issues.problemsubmission.service;

import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> response = responseEntity.getBody();
            
            if (response != null && response.get("data") instanceof Map<?, ?> dataMap) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) dataMap;
                return data;
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

    /**
     * Calls AI Matchmaking Engine to recommend top 3 Higher Education Institutions (HEIs) for this challenge.
     */
    public Map<String, Object> routeChallengeToHEIs(GrassrootIssue issue) {
        try {
            String endpoint = aiServiceUrl + "/api/v1/route";

            Map<String, Object> payload = new HashMap<>();
            payload.put("challenge_id", issue.getIssueNumber());
            payload.put("title", issue.getTitle() != null ? issue.getTitle() : "");
            payload.put("description", issue.getDescription() != null ? issue.getDescription() : "");
            payload.put("district", issue.getDistrict() != null ? issue.getDistrict() : "Ranchi");
            payload.put("block", issue.getBlock() != null ? issue.getBlock() : "");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            Map<String, Object> response = restTemplate.postForObject(endpoint, requestEntity, Map.class);
            if (response != null && response.containsKey("recommended_heis")) {
                return response;
            }
        } catch (Exception e) {
            log.warn("AI Service routing failed for issue #{}: {}. Applying deterministic HEI matcher fallback.", issue.getIssueNumber(), e.getMessage());
        }

        return generateFallbackRouting(issue);
    }

    private Map<String, Object> generateFallbackRouting(GrassrootIssue issue) {
        String sec = issue.getSector() != null ? issue.getSector().name() : "OTHER";
        String dist = issue.getDistrict() != null ? issue.getDistrict() : "Ranchi";

        List<Map<String, Object>> matches = new ArrayList<>();

        if ("AGRICULTURE".equalsIgnoreCase(sec) || "LIVELIHOOD".equalsIgnoreCase(sec)) {
            matches.add(Map.of(
                "hei_id", "BAU_RANCHI",
                "hei_name", "Birsa Agricultural University (BAU), Kanke",
                "match_score", 0.96,
                "rationale", "Primary state agricultural research university with specialized Agronomy and Plant Pathology labs."
            ));
            matches.add(Map.of(
                "hei_id", "BIT_MESRA",
                "hei_name", "Birla Institute of Technology (BIT) Mesra, Ranchi",
                "match_score", 0.82,
                "rationale", "Strong engineering capabilities for agro-tech automation."
            ));
        } else if ("ENVIRONMENT".equalsIgnoreCase(sec) || "ELECTRICITY".equalsIgnoreCase(sec) || "Dhanbad".equalsIgnoreCase(dist)) {
            matches.add(Map.of(
                "hei_id", "IIT_ISM_DHANBAD",
                "hei_name", "IIT (ISM) Dhanbad",
                "match_score", 0.95,
                "rationale", "National institute of excellence in environmental engineering, mining, and clean energy systems."
            ));
            matches.add(Map.of(
                "hei_id", "BIT_MESRA",
                "hei_name", "Birla Institute of Technology (BIT) Mesra, Ranchi",
                "match_score", 0.85,
                "rationale", "Comprehensive environmental and energy research facilities."
            ));
        } else {
            matches.add(Map.of(
                "hei_id", "BIT_MESRA",
                "hei_name", "Birla Institute of Technology (BIT) Mesra, Ranchi",
                "match_score", 0.94,
                "rationale", "Premier state technical institution with multidisciplinary engineering & robotics labs."
            ));
            matches.add(Map.of(
                "hei_id", "NIT_JAMSHEDPUR",
                "hei_name", "National Institute of Technology (NIT) Jamshedpur",
                "match_score", 0.88,
                "rationale", "Advanced civil infrastructure and water management facilities."
            ));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("recommended_heis", matches);
        return result;
    }
}
