package com.example.social_issues.auth.repository;

import com.example.social_issues.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);
    Optional<User> findFirstByEmailIgnoreCase(String email);
    Optional<User> findFirstByPhone(String phone);
    Optional<User> findFirstByEmailIgnoreCaseOrderByIdDesc(String email);
    Optional<User> findFirstByPhoneOrderByIdDesc(String phone);
    List<User> findAllByEmailIgnoreCase(String email);
    List<User> findAllByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
}
