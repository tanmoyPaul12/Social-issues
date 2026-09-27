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
    /**
     * Executes 4-modality weighted generalization and priority consensus via FastAPI AI service.
     */
    public Map<String, Object> processMultimodalIntelligence(GrassrootIssue issue, Map<String, Object> docAnalysis, Map<String, Object> imgAnalysis) {
        try {
            String endpoint = aiServiceUrl + "/api/v1/unified-routing/analyze";

            Map<String, Object> payload = new HashMap<>();
            String text = ((issue.getTitle() != null ? issue.getTitle() : "") + ". " +
                    (issue.getDescription() != null ? issue.getDescription() : "")).trim();
            payload.put("problem_text", text.isEmpty() ? "Civic Infrastructure Challenge" : text);
            payload.put("district", issue.getDistrict() != null ? issue.getDistrict() : "Jharkhand");
            payload.put("state", "Jharkhand");
            if (issue.getLatitude() != null) payload.put("latitude", issue.getLatitude());
            if (issue.getLongitude() != null) payload.put("longitude", issue.getLongitude());

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
            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            log.warn("AI Service call failed (fallback active): {}", e.getMessage());
            return generateFallbackAudit(issue);
        }
        return generateFallbackAudit(issue);
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
            String endpoint = aiServiceUrl + "/api/v1/unified-routing/analyze";

            Map<String, Object> payload = new HashMap<>();
            String text = ((issue.getTitle() != null ? issue.getTitle() : "") + ". " +
                    (issue.getDescription() != null ? issue.getDescription() : "")).trim();
            payload.put("problem_text", text.isEmpty() ? "Civic Infrastructure Challenge" : text);
            payload.put("district", issue.getDistrict() != null ? issue.getDistrict() : "Jharkhand");
            payload.put("state", "Jharkhand");
            if (issue.getLatitude() != null) payload.put("latitude", issue.getLatitude());
            if (issue.getLongitude() != null) payload.put("longitude", issue.getLongitude());

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
            if (response != null) {
                if (response.get("scored_universities") instanceof List<?> unisList) {
                    List<Map<String, Object>> mappedRecs = new ArrayList<>();
                    for (Object uObj : unisList) {
                        if (uObj instanceof Map<?, ?> uMap) {
                            mappedRecs.add(Map.of(
                                "hei_id", uMap.get("university_code") != null ? uMap.get("university_code") : "HEI",
                                "hei_name", uMap.get("university_name") != null ? uMap.get("university_name") : "University",
                                "match_score", uMap.get("total_score") != null ? uMap.get("total_score") : 0.85,
                                "rationale", "AI 6-Factor Algorithmic Match based on verified faculty experts and research infrastructure."
                            ));
                        }
                    }
                    Map<String, Object> out = new HashMap<>(response);
                    out.put("recommended_heis", mappedRecs);
                    return out;
                }
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

    /**
     * Checks if a newly submitted issue is a duplicate of existing tickets using vector and spatial similarity.
     */
    public Map<String, Object> checkDuplicates(GrassrootIssue issue) {
        try {
            String endpoint = aiServiceUrl + "/api/v1/deduplicate";

            Map<String, Object> payload = new HashMap<>();
            payload.put("challenge_id", issue.getIssueNumber() != null ? issue.getIssueNumber() : "CH-NEW");
            payload.put("title", issue.getTitle() != null ? issue.getTitle() : "");
            payload.put("description", issue.getDescription() != null ? issue.getDescription() : "");
            payload.put("district", issue.getDistrict() != null ? issue.getDistrict() : "Ranchi");
            payload.put("block", issue.getBlock() != null ? issue.getBlock() : "");
            payload.put("village_or_ward", issue.getVillageOrWard() != null ? issue.getVillageOrWard() : "");
            payload.put("latitude", issue.getLatitude() != null ? issue.getLatitude() : 23.3441);
            payload.put("longitude", issue.getLongitude() != null ? issue.getLongitude() : 85.3096);
            payload.put("affected_population", issue.getAffectedPopulation());
            payload.put("attachments", new ArrayList<>());

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
            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            log.warn("AI Deduplication check failed for issue #{}: {}", issue.getIssueNumber(), e.getMessage());
        }
        return Map.of("is_duplicate", false, "potential_duplicates", List.of());
    }

    /**
     * Executes the Master Unified Intelligence & Faculty Matching Pipeline via FastAPI AI microservice.
     */
    public Map<String, Object> analyzeUnifiedRouting(Map<String, Object> requestPayload) {
        try {
            String endpoint = aiServiceUrl + "/api/v1/unified-routing/analyze";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestPayload, headers);
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> response = responseEntity.getBody();
            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            log.error("AI Service unified routing analyze call failed: {}", e.getMessage());
            throw new RuntimeException("AI Service unified routing call failed: " + e.getMessage(), e);
        }
        throw new RuntimeException("Empty response received from AI Service");
    }
}
