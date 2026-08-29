package com.example.social_issues.common.config;

import io.minio.MinioClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    private static final Logger log = LoggerFactory.getLogger(MinioConfig.class);

    @Value("${minio.endpoint:https://1e4624d96732ff52dc64930a30201276.r2.cloudflarestorage.com}")
    private String endpoint;

    @Value("${minio.access-key:minioadmin}")
    private String accessKey;

    @Value("${minio.secret-key:minioadmin}")
    private String secretKey;

    @Value("${minio.region:auto}")
    private String region;

    @Bean
    public MinioClient minioClient() {
        log.info("Initializing S3/Cloudflare R2 storage client targeting endpoint: {}", endpoint);
        try {
            return MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .region(region != null && !region.isBlank() ? region : "auto")
                    .build();
        } catch (Exception e) {
            log.warn("S3/R2 client initialization error: {}", e.getMessage());
            return MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();
        }
    }
}
