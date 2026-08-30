package com.example.social_issues.auth.service;

import com.example.social_issues.auth.dto.UserSummaryDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RedisSessionService {

    private static final Logger log = LoggerFactory.getLogger(RedisSessionService.class);
    private static final String SESSION_PREFIX = "jh:session:";
    private static final String USER_TOKEN_PREFIX = "jh:user_tokens:";
    private static final String REFRESH_TOKEN_PREFIX = "jh:refresh_token:";
    private static final String USER_REFRESH_PREFIX = "jh:user_refresh:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    // Fast in-memory cache fallbacks
    private final Map<String, UserSummaryDto> localSessionCache = new ConcurrentHashMap<>();
    private final Map<String, RefreshTokenData> localRefreshCache = new ConcurrentHashMap<>();

    public record RefreshTokenData(Long userId, String role, long createdAtMs) {}

    public RedisSessionService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Store active access session in local memory and Redis.
     */
    public void saveSession(String accessToken, UserSummaryDto user, Duration ttl) {
        localSessionCache.put(accessToken, user);

        CompletableFuture.runAsync(() -> {
            try {
                String sessionKey = SESSION_PREFIX + accessToken;
                String userJson = objectMapper.writeValueAsString(user);
                redisTemplate.opsForValue().set(sessionKey, userJson, ttl);

                String userTokensKey = USER_TOKEN_PREFIX + user.getId();
                redisTemplate.opsForSet().add(userTokensKey, accessToken);
                redisTemplate.expire(userTokensKey, ttl);
            } catch (Exception e) {
                log.debug("Redis write skipped (in-memory session active): {}", e.getMessage());
            }
        });
    }

    /**
     * Retrieve active access session from memory or Redis.
     */
    public UserSummaryDto getSession(String accessToken) {
        UserSummaryDto memoryUser = localSessionCache.get(accessToken);
        if (memoryUser != null) {
            return memoryUser;
        }

        try {
            String sessionKey = SESSION_PREFIX + accessToken;
            String userJson = redisTemplate.opsForValue().get(sessionKey);
            if (userJson != null && !userJson.isBlank()) {
                UserSummaryDto user = objectMapper.readValue(userJson, UserSummaryDto.class);
                localSessionCache.put(accessToken, user);
                return user;
            }
        } catch (Exception e) {
            log.debug("Could not retrieve session from Redis: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Delete active access session.
     */
    public void deleteSession(String accessToken) {
        localSessionCache.remove(accessToken);
        CompletableFuture.runAsync(() -> {
            try {
                String sessionKey = SESSION_PREFIX + accessToken;
                redisTemplate.delete(sessionKey);
            } catch (Exception e) {
                log.debug("Redis delete skipped: {}", e.getMessage());
            }
        });
    }

    /**
     * Store Refresh Token in Redis for stateful lifecycle tracking and rotation.
     */
    public void saveRefreshToken(String refreshToken, Long userId, String role, Duration ttl) {
        RefreshTokenData data = new RefreshTokenData(userId, role, System.currentTimeMillis());
        localRefreshCache.put(refreshToken, data);

        CompletableFuture.runAsync(() -> {
            try {
                String refreshKey = REFRESH_TOKEN_PREFIX + refreshToken;
                String json = objectMapper.writeValueAsString(data);
                redisTemplate.opsForValue().set(refreshKey, json, ttl);

                String userRefreshKey = USER_REFRESH_PREFIX + userId;
                redisTemplate.opsForSet().add(userRefreshKey, refreshToken);
                redisTemplate.expire(userRefreshKey, ttl);
                log.info("Refresh token registered in Redis for user [{}]", userId);
            } catch (Exception e) {
                log.debug("Redis refresh token save fallback to memory: {}", e.getMessage());
            }
        });
    }

    /**
     * Validate and retrieve stored Refresh Token data.
     */
    public RefreshTokenData getRefreshTokenData(String refreshToken) {
        RefreshTokenData data = localRefreshCache.get(refreshToken);
        if (data != null) {
            return data;
        }

        try {
            String refreshKey = REFRESH_TOKEN_PREFIX + refreshToken;
            String json = redisTemplate.opsForValue().get(refreshKey);
            if (json != null && !json.isBlank()) {
                data = objectMapper.readValue(json, RefreshTokenData.class);
                localRefreshCache.put(refreshToken, data);
                return data;
            }
        } catch (Exception e) {
            log.debug("Could not query Redis for refresh token: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Revoke a single refresh token upon rotation or logout.
     */
    public void revokeRefreshToken(String refreshToken) {
        localRefreshCache.remove(refreshToken);
        CompletableFuture.runAsync(() -> {
            try {
                String refreshKey = REFRESH_TOKEN_PREFIX + refreshToken;
                redisTemplate.delete(refreshKey);
            } catch (Exception e) {
                log.debug("Redis refresh token revoke skipped: {}", e.getMessage());
            }
        });
    }

    /**
     * Revoke all active sessions and refresh tokens for a user (e.g. security reset).
     */
    public void revokeAllUserTokens(Long userId) {
        CompletableFuture.runAsync(() -> {
            try {
                String userRefreshKey = USER_REFRESH_PREFIX + userId;
                Set<String> tokens = redisTemplate.opsForSet().members(userRefreshKey);
                if (tokens != null) {
                    for (String token : tokens) {
                        localRefreshCache.remove(token);
                        redisTemplate.delete(REFRESH_TOKEN_PREFIX + token);
                    }
                }
                redisTemplate.delete(userRefreshKey);

                String userTokensKey = USER_TOKEN_PREFIX + userId;
                Set<String> accessTokens = redisTemplate.opsForSet().members(userTokensKey);
                if (accessTokens != null) {
                    for (String token : accessTokens) {
                        localSessionCache.remove(token);
                        redisTemplate.delete(SESSION_PREFIX + token);
                    }
                }
                redisTemplate.delete(userTokensKey);
            } catch (Exception e) {
                log.debug("Redis revokeAllUserTokens failed: {}", e.getMessage());
            }
        });
    }
}
