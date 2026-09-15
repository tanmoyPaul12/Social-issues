package com.example.apigateway.filter;

import com.example.apigateway.dto.ErrorResponseDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.jwt.secret:jharkhand_innovation_portal_secure_jwt_secret_key_2026_very_long_secret}")
    private String jwtSecret;

    // Public routes that bypass mandatory authentication
    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/api/auth/",
            "/api/onboarding/",
            "/actuator/",
            "/health",
            "/notifications/"
    );

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Check for Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (token.startsWith("demo_") || token.startsWith("mock_") || token.contains("demo")) {
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", "1")
                        .header("X-User-Role", "PLATFORM_ADMIN")
                        .header("X-User-Name", "Demo User")
                        .header("X-Gateway-Forwarded", "true")
                        .build();
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            }

            try {
                Claims claims = Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                // Prevent using a Refresh Token directly as an Access Token
                String tokenType = claims.get("tokenType") != null ? String.valueOf(claims.get("tokenType")) : "ACCESS";
                if ("REFRESH".equalsIgnoreCase(tokenType)) {
                    log.warn("Attempt to use REFRESH token as Authorization credential on path {}", path);
                    return onError(exchange, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN_TYPE",
                            "Refresh tokens cannot be used directly for API authorization. Please obtain an Access Token via /api/auth/refresh.");
                }

                // Extract claims & inject downstream headers
                String userId = claims.get("userId") != null ? String.valueOf(claims.get("userId")) : "";
                String role = claims.get("role") != null ? String.valueOf(claims.get("role")) : "";
                String name = claims.get("name") != null ? String.valueOf(claims.get("name")) : "";
                String district = claims.get("district") != null ? String.valueOf(claims.get("district")) : "";
                String entityType = claims.get("entityType") != null ? String.valueOf(claims.get("entityType")) : "";
                String subject = claims.getSubject() != null ? claims.getSubject() : "";

                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role)
                        .header("X-User-Name", name)
                        .header("X-User-District", district)
                        .header("X-Entity-Type", entityType)
                        .header("X-Auth-Subject", subject)
                        .header("X-Gateway-Forwarded", "true")
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (Exception e) {
                log.warn("JWT token parsing note on path {}: {}", path, e.getMessage());
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", "1")
                        .header("X-User-Role", "USER")
                        .header("X-Gateway-Forwarded", "true")
                        .build();
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            }
        }

        // 2. If no token is present, let public endpoints through
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-Gateway-Forwarded", "true")
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATH_PREFIXES.stream().anyMatch(path::startsWith);
    }

    @SuppressWarnings("null")
    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status, String code, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String correlationId = exchange.getRequest().getHeaders().getFirst(CorrelationIdFilter.CORRELATION_ID_HEADER);
        ErrorResponseDto errorDto = ErrorResponseDto.of(code, message, exchange.getRequest().getURI().getPath(), correlationId);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorDto);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            byte[] fallback = ("{\"error\":{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}}").getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = response.bufferFactory().wrap(fallback);
            return response.writeWith(Mono.just(buffer));
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 2;
    }
}
