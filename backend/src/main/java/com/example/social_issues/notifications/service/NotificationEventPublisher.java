package com.example.social_issues.notifications.service;

import com.example.social_issues.notifications.dto.NotificationEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class NotificationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventPublisher.class);

    public static final String CHANNEL_INDUSTRY = "events:industry:notifications";
    public static final String CHANNEL_CITIZEN = "events:citizen:notifications";
    public static final String CHANNEL_GENERAL = "events:general:notifications";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public NotificationEventPublisher(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Publish notification to industry partners channel (consumed by notification-service and SSE)
     */
    public void publishIndustryNotification(NotificationEvent event) {
        publish(CHANNEL_INDUSTRY, event);
    }

    /**
     * Publish notification to citizen users channel
     */
    public void publishCitizenNotification(NotificationEvent event) {
        publish(CHANNEL_CITIZEN, event);
    }

    /**
     * Publish notification to general notifications channel
     */
    public void publishGeneralNotification(NotificationEvent event) {
        publish(CHANNEL_GENERAL, event);
    }

    /**
     * Generic Redis Pub/Sub publish method
     */
    public void publish(String channel, NotificationEvent event) {
        if (event == null) {
            return;
        }
        if (event.getEventId() == null || event.getEventId().isBlank()) {
            event.setEventId(UUID.randomUUID().toString());
        }
        if (event.getTimestamp() == null || event.getTimestamp().isBlank()) {
            event.setTimestamp(Instant.now().toString());
        }

        try {
            String json = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(channel, json);
            log.info("Published notification event [{}] of type [{}] to Redis channel [{}]",
                    event.getEventId(), event.getEventType(), channel);
        } catch (Exception e) {
            log.warn("Failed to publish notification event to Redis channel [{}]: {}", channel, e.getMessage());
        }
    }
}
