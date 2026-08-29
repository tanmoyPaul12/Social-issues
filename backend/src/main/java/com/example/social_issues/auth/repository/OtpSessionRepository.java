package com.example.social_issues.auth.repository;

import com.example.social_issues.auth.model.OtpSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpSessionRepository extends JpaRepository<OtpSession, Long> {
    Optional<OtpSession> findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(String phone);
    Optional<OtpSession> findTopByPhoneAndVerifiedFalseOrderByExpiresAtDesc(String phone);
    Optional<OtpSession> findTopByPhoneOrderByExpiresAtDesc(String phone);
}
