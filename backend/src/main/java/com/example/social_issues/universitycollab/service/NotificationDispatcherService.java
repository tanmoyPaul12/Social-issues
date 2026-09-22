package com.example.social_issues.universitycollab.service;

import com.example.social_issues.notifications.dto.NotificationEvent;
import com.example.social_issues.notifications.service.NotificationEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@Service
public class NotificationDispatcherService {

    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcherService.class);

    @Value("${notification.service.url:http://localhost:8082}")
    private String notificationServiceUrl;

    private final RestTemplate restTemplate;
    private final NotificationEventPublisher notificationEventPublisher;

    public NotificationDispatcherService(NotificationEventPublisher notificationEventPublisher) {
        this.restTemplate = new RestTemplate();
        this.notificationEventPublisher = notificationEventPublisher;
    }

    public boolean publishNotification(String eventType, String title, String message, String recipientUserId, String severity, String actionUrl) {
        // 1. Decoupled Redis Event Publishing
        try {
            NotificationEvent event = new NotificationEvent();
            event.setEventType(eventType != null ? eventType : "GENERAL_ALERT");
            event.setSource("UNIVERSITY_COLLAB");
            if (recipientUserId != null) {
                try {
                    event.setRecipientUserId(Long.parseLong(recipientUserId));
                } catch (NumberFormatException ignored) {
                    event.setRecipientEmail(recipientUserId);
                }
            }
            event.setTitle(title);
            event.setMessage(message);
            event.setSeverity(severity != null ? severity : "INFO");
            event.setActionUrl(actionUrl);
            event.setChannels(List.of("IN_APP", "EMAIL"));
            event.setTimestamp(Instant.now().toString());

            notificationEventPublisher.publishCitizenNotification(event);
        } catch (Exception e) {
            log.warn("Failed to publish via Redis in NotificationDispatcherService: {}", e.getMessage());
        }

        // 2. HTTP Fallback Dispatch
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
            payload.put("channels", List.of("IN_APP", "EMAIL"));
            payload.put("timestamp", Instant.now().toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForObject(endpoint, request, Map.class);
            log.info("Dispatched notification event: {} to recipient: {}", eventType, recipientUserId);
            return true;
        } catch (Exception ex) {
            log.debug("HTTP notification fallback skipped: {}", ex.getMessage());
            return true;
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

