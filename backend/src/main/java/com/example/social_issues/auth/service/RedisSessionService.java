package com.example.social_issues.auth.service;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RedisSessionService {

    private static final Logger log = LoggerFactory.getLogger(RedisSessionService.class);
    private static final String SESSION_PREFIX = "jh:session:";
    private static final String USER_TOKEN_PREFIX = "jh:user_tokens:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    // Fast in-memory cache fallback to guarantee instant sub-millisecond response
    private final Map<String, UserSummaryDto> localSessionCache = new ConcurrentHashMap<>();

    public RedisSessionService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Store active session in local memory instantly and asynchronously in Redis.
     */
    public void saveSession(String token, UserSummaryDto user, Duration ttl) {
        // 1. Instant in-memory storage (0ms delay)
        localSessionCache.put(token, user);

        // 2. Non-blocking async write to Redis
        CompletableFuture.runAsync(() -> {
            try {
                String sessionKey = SESSION_PREFIX + token;
                String userJson = objectMapper.writeValueAsString(user);
                redisTemplate.opsForValue().set(sessionKey, userJson, ttl);

                String userTokensKey = USER_TOKEN_PREFIX + user.getId();
                redisTemplate.opsForSet().add(userTokensKey, token);
                redisTemplate.expire(userTokensKey, ttl);
                log.info("Active session cached in Redis for user [{}]", user.getId());
            } catch (Exception e) {
                log.debug("Redis write skipped (in-memory session active): {}", e.getMessage());
            }
        });
    }

    /**
     * Retrieve active session instantly from memory or Redis.
     */
    public UserSummaryDto getSession(String token) {
        // Check in-memory first (0ms)
        UserSummaryDto memoryUser = localSessionCache.get(token);
        if (memoryUser != null) {
            return memoryUser;
        }

        try {
            String sessionKey = SESSION_PREFIX + token;
            String userJson = redisTemplate.opsForValue().get(sessionKey);
            if (userJson != null && !userJson.isBlank()) {
                UserSummaryDto user = objectMapper.readValue(userJson, UserSummaryDto.class);
                localSessionCache.put(token, user);
                return user;
            }
        } catch (Exception e) {
            log.debug("Could not retrieve session from Redis: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Invalidate/Delete session.
     */
    public void deleteSession(String token) {
        localSessionCache.remove(token);
        CompletableFuture.runAsync(() -> {
            try {
                String sessionKey = SESSION_PREFIX + token;
                redisTemplate.delete(sessionKey);
            } catch (Exception e) {
                log.debug("Redis delete skipped: {}", e.getMessage());
            }
        });
    }

    /**
     * Check if token session is active.
     */
    public boolean hasActiveSession(String token) {
        if (localSessionCache.containsKey(token)) {
            return true;
        }
        try {
            String sessionKey = SESSION_PREFIX + token;
            Boolean hasKey = redisTemplate.hasKey(sessionKey);
            return Boolean.TRUE.equals(hasKey);
        } catch (Exception e) {
            return false;
        }
    }
}
