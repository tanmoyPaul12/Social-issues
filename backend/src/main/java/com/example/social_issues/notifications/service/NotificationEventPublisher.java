package com.example.social_issues.notifications.service;

import com.example.social_issues.notifications.dto.NotificationEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventPublisher.class);
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public static final String INDUSTRY_CHANNEL = "events:industry:notifications";
    public static final String CITIZEN_CHANNEL = "events:citizen:notifications";
    public static final String GENERAL_CHANNEL = "events:general:notifications";

    public NotificationEventPublisher(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public void publishIndustryNotification(NotificationEvent event) {
        publishToChannel(INDUSTRY_CHANNEL, event);
    }

    public void publishCitizenNotification(NotificationEvent event) {
        publishToChannel(CITIZEN_CHANNEL, event);
    }

    public void publishToChannel(String channel, NotificationEvent event) {
        if (event.getEventId() == null || event.getEventId().isBlank()) {
            event.setEventId("evt_" + UUID.randomUUID().toString().substring(0, 8));
        }

        try {
            String jsonPayload = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(channel, jsonPayload);
            log.info("Successfully published event '{}' ({}) to Redis channel '{}'",
                    event.getTitle(), event.getEventType(), channel);
        } catch (Exception e) {
            log.warn("Failed to publish event to Redis channel '{}': {}", channel, e.getMessage());
        }
    }
}
