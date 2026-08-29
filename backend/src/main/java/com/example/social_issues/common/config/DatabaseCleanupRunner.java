package com.example.social_issues.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseCleanupRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseCleanupRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseCleanupRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Checking database schema and cleaning legacy test artifacts...");

            // Create tables if not yet created by Hibernate
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    phone VARCHAR(30) UNIQUE,
                    email VARCHAR(150),
                    password_hash VARCHAR(255),
                    role VARCHAR(30) NOT NULL,
                    reference_id VARCHAR(60),
                    verification_status VARCHAR(30),
                    is_verified BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);

            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS university_profiles (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    univ_name VARCHAR(255) NOT NULL,
                    aishe_code VARCHAR(50) NOT NULL,
                    univ_category VARCHAR(100),
                    nodal_spoc_name VARCHAR(150),
                    designation VARCHAR(120),
                    district VARCHAR(80),
                    disciplines VARCHAR(800),
                    has_incubation_center BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);

            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS industry_profiles (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    company_name VARCHAR(255) NOT NULL,
                    company_type VARCHAR(80),
                    gstin VARCHAR(50) NOT NULL,
                    cin_number VARCHAR(50),
                    csr_number VARCHAR(50),
                    spoc_name VARCHAR(150),
                    designation VARCHAR(120),
                    district VARCHAR(80),
                    sectors VARCHAR(800),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);

            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS government_profiles (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    dept_name VARCHAR(255) NOT NULL,
                    service_code VARCHAR(50) NOT NULL,
                    nodal_officer_name VARCHAR(150),
                    designation VARCHAR(120),
                    district VARCHAR(80),
                    panchayat_code VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);

            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS citizen_profiles (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    entity_type VARCHAR(30) DEFAULT 'INDIVIDUAL',
                    district VARCHAR(80),
                    block VARCHAR(80),
                    language VARCHAR(80),
                    group_name VARCHAR(150),
                    leader_spoc VARCHAR(150),
                    member_count INT,
                    org_name VARCHAR(150),
                    org_code VARCHAR(80),
                    nodal_person VARCHAR(150),
                    panchayat_code VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);

            log.info("Database role tables verified and ready.");
        } catch (Exception e) {
            log.warn("Database initialization notice: {}", e.getMessage());
        }
    }
}
