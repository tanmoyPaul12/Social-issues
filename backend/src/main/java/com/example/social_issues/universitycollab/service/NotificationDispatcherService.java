package com.example.social_issues.universitycollab.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationDispatcherService {

    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcherService.class);

    @Value("${notification.service.url:http://localhost:8082}")
    private String notificationServiceUrl;

    private final RestTemplate restTemplate;

    public NotificationDispatcherService() {
        this.restTemplate = new RestTemplate();
    }

    public boolean publishNotification(String eventType, String title, String message, String recipientUserId, String severity, String actionUrl) {
        try {
            String endpoint = notificationServiceUrl + "/notifications/publish";

            Map<String, Object> payload = new HashMap<>();
            payload.put("eventId", "evt_" + UUID.randomUUID().toString().substring(0, 8));
            payload.put("eventType", eventType != null ? eventType : "GENERAL_ALERT");
            payload.put("title", title);
            payload.put("message", message);
            payload.put("recipientUserId", recipientUserId);
            payload.put("severity", severity != null ? severity : "INFO");
            payload.put("actionUrl", actionUrl);
            payload.put("channels", Collections.singletonList("IN_APP"));
            payload.put("timestamp", LocalDateTime.now().toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForObject(endpoint, request, Map.class);
            log.info("Dispatched notification event: {} to recipient: {}", eventType, recipientUserId);
            return true;
        } catch (Exception ex) {
            log.warn("Notification microservice unavailable at {}: {}. Proceeding without breaking main flow.", notificationServiceUrl, ex.getMessage());
            return false;
        }
    }

    public boolean dispatchCitizenVerificationNotice(Long projectId, String recipientUserId, String issueTitle, String district) {
        String title = "🎓 University Adopted Your Issue for R&D!";
        String message = String.format("A university research team has adopted '%s' in %s for active development and field verification.",
                issueTitle != null ? issueTitle : "your reported issue",
                district != null ? district : "your area");
        String actionUrl = "/issues/" + (projectId != null ? projectId : "");
        return publishNotification(
                "CITIZEN_CHALLENGE_ADOPTED",
                title,
                message,
                recipientUserId,
                "SUCCESS",
                actionUrl
        );
    }
}

