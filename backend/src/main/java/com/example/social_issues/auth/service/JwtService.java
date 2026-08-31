package com.example.social_issues.auth.service;

import com.example.social_issues.auth.model.Role;
import com.example.social_issues.auth.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret:jharkhand_innovation_portal_secure_jwt_secret_key_2026_very_long_secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-expiration-ms:900000}") // 15 minutes
    private long accessExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms:604800000}") // 7 days
    private long refreshExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate short-lived stateless Access Token (15 min) for API operations.
     */
    public String generateAccessToken(User user, Role activeRole) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId() != null ? String.valueOf(user.getId()) : "");
        claims.put("name", user.getName());
        claims.put("entityType", user.getEntityType() != null ? user.getEntityType().name() : "INDIVIDUAL");
        claims.put("role", activeRole != null ? activeRole.name() : (user.getRole() != null ? user.getRole().name() : "CITIZEN"));
        claims.put("district", user.getDistrict() != null ? user.getDistrict() : "");
        claims.put("tokenType", "ACCESS");
        claims.put("jti", UUID.randomUUID().toString());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getPhone() != null ? user.getPhone() : user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + accessExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateAccessToken(User user) {
        return generateAccessToken(user, user.getRole());
    }

    /**
     * Generate long-lived Refresh Token (7 days or 30 days) for rotating credentials.
     */
    public String generateRefreshToken(User user, Role activeRole, boolean rememberMe) {
        long expiration = rememberMe ? (30L * 24 * 3600 * 1000) : refreshExpirationMs;

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId() != null ? String.valueOf(user.getId()) : "");
        claims.put("role", activeRole != null ? activeRole.name() : (user.getRole() != null ? user.getRole().name() : "CITIZEN"));
        claims.put("tokenType", "REFRESH");
        claims.put("jti", UUID.randomUUID().toString());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getPhone() != null ? user.getPhone() : user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(User user) {
        return generateRefreshToken(user, user.getRole(), false);
    }

    /**
     * Backward-compatible alias for generateAccessToken.
     */
    public String generateToken(User user) {
        return generateAccessToken(user, user.getRole());
    }

    public String generateToken(User user, Role activeRole) {
        return generateAccessToken(user, activeRole);
    }

    public long getAccessExpirationSeconds() {
        return accessExpirationMs / 1000;
    }

    public long getRefreshExpirationMs(boolean rememberMe) {
        return rememberMe ? (30L * 24 * 3600 * 1000) : refreshExpirationMs;
    }

    public String extractTokenType(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null && claims.get("tokenType") != null ? String.valueOf(claims.get("tokenType")) : null;
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null && claims.get("role") != null ? String.valueOf(claims.get("role")) : null;
    }

    public String extractPhone(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null && claims.get("userId") != null ? String.valueOf(claims.get("userId")) : null;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claims != null ? claimsResolver.apply(claims) : null;
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null && claims.getExpiration() != null && claims.getExpiration().after(new Date());
    }

    public boolean validateAccessToken(String token) {
        Claims claims = extractAllClaims(token);
        if (claims == null || claims.getExpiration() == null || claims.getExpiration().before(new Date())) {
            return false;
        }
        Object type = claims.get("tokenType");
        return type == null || "ACCESS".equalsIgnoreCase(String.valueOf(type));
    }

    public boolean validateRefreshToken(String token) {
        Claims claims = extractAllClaims(token);
        if (claims == null || claims.getExpiration() == null || claims.getExpiration().before(new Date())) {
            return false;
        }
        Object type = claims.get("tokenType");
        return "REFRESH".equalsIgnoreCase(String.valueOf(type));
    }
}
