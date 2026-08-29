package com.example.social_issues.auth.service;

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
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret:jharkhand_innovation_portal_secure_jwt_secret_key_2026_very_long_secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:604800000}") // 7 days
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            // Pad to 32 bytes minimum for HS256
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        return generateToken(user, user.getRole());
    }

    public String generateToken(User user, com.example.social_issues.auth.model.Role activeRole) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId() != null ? String.valueOf(user.getId()) : "");
        claims.put("name", user.getName());
        claims.put("entityType", user.getEntityType() != null ? user.getEntityType().name() : "INDIVIDUAL");
        claims.put("role", activeRole != null ? activeRole.name() : (user.getRole() != null ? user.getRole().name() : "CITIZEN"));
        claims.put("district", user.getDistrict() != null ? user.getDistrict() : "");

        return Jwts.builder()
                .claims(claims)
                .subject(user.getPhone() != null ? user.getPhone() : user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractPhone(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null && claims.get("userId") != null ? String.valueOf(claims.get("userId")) : null;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claims != null ? claimsResolver.apply(claims) : null;
    }

    private Claims extractAllClaims(String token) {
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

    public boolean validateToken(String token, User user) {
        final String phone = extractPhone(token);
        return (phone != null && phone.equals(user.getPhone()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        final Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration != null && expiration.before(new Date());
    }
}
