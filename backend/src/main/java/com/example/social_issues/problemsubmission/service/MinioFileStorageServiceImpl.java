package com.example.social_issues.problemsubmission.service;

import com.example.social_issues.common.security.FileEncryptionService;
import com.example.social_issues.problemsubmission.model.AttachmentType;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

@Service
public class MinioFileStorageServiceImpl implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(MinioFileStorageServiceImpl.class);

    private final MinioClient minioClient;
    private final FileEncryptionService encryptionService;

    @Value("${minio.endpoint:http://localhost:9000}")
    private String endpoint;

    @Value("${minio.bucket-name:evidence-uploads}")
    private String bucketName;

    private boolean isMinioAvailable = false;
    private final Path localFallbackDir = Paths.get("uploads").toAbsolutePath().normalize();

    public MinioFileStorageServiceImpl(MinioClient minioClient, FileEncryptionService encryptionService) {
        this.minioClient = minioClient;
        this.encryptionService = encryptionService;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(localFallbackDir);
            try {
                boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
                if (!exists) {
                    try {
                        minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                        log.info("Successfully created S3/R2 bucket '{}'", bucketName);
                    } catch (Exception createEx) {
                        log.info("Notice on creating bucket '{}': {}. Assuming existing R2 bucket.", bucketName, createEx.getMessage());
                    }
                }
            } catch (Exception be) {
                log.info("Notice on checking bucket '{}' in Cloudflare R2: {}", bucketName, be.getMessage());
            }

            isMinioAvailable = true;
            log.info("S3/Cloudflare R2 storage initialized and active on bucket '{}' (endpoint: {})", bucketName, endpoint);
        } catch (Exception e) {
            log.warn("S3/Cloudflare R2 initialization warning ({}). Utilizing local storage fallback directory: {}",
                    e.getMessage(), localFallbackDir);
            isMinioAvailable = false;
        }
    }

    @Override
    public StoredFile storeFile(MultipartFile file, String folderPrefix) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty or null file");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file";
        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String extension = getExtension(cleanName);
        String uniqueId = UUID.randomUUID().toString();
        String folder = (folderPrefix != null && !folderPrefix.isBlank()) ? folderPrefix.trim() : "general";
        String storageKey = folder + "/" + uniqueId + "-" + cleanName;

        String mimeType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        AttachmentType attachmentType = resolveAttachmentType(mimeType, extension);
        long originalSize = file.getSize();

        // 1. Apply Application-Level AES-256-GCM Envelope Encryption
        FileEncryptionService.EncryptedPayload encryptedPayload;
        try (InputStream is = file.getInputStream()) {
            encryptedPayload = encryptionService.encryptInputStream(is, originalSize);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read and encrypt incoming file: " + e.getMessage(), e);
        }

        // 2. Try MinIO / Cloudflare R2 upload with encrypted bytes
        try {
            ensureBucketReady();
            try (InputStream uploadStream = new ByteArrayInputStream(encryptedPayload.data())) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(storageKey)
                                .stream(uploadStream, encryptedPayload.sizeBytes(), -1)
                                .contentType("application/octet-stream") // Stored as encrypted binary envelope
                                .build()
                );

                // Verification & cleanup: Ensure zero leftover local disk copies when R2 upload succeeds
                cleanUpLocalFileIfExists(folder, uniqueId + "-" + cleanName);

                String fileUrl = endpoint + "/" + bucketName + "/" + storageKey;
                log.info("Stored AES-256 encrypted file in MinIO/R2: {} ({} bytes)", storageKey, encryptedPayload.sizeBytes());
                return new StoredFile(fileUrl, storageKey, originalName, mimeType, originalSize, attachmentType, true);
            }
        } catch (Exception ex) {
            log.warn("MinIO upload failed ({}). Storing encrypted file in local filesystem fallback.", ex.getMessage());
            isMinioAvailable = false;
            return storeInLocalStorage(encryptedPayload.data(), folder, uniqueId, cleanName, originalName, mimeType, originalSize, attachmentType);
        }
    }

    private StoredFile storeInLocalStorage(byte[] encryptedBytes, String folder, String uniqueId, String cleanName,
                                          String originalName, String mimeType, long originalSize, AttachmentType attachmentType) {
        try {
            Path targetFolder = localFallbackDir.resolve(folder);
            Files.createDirectories(targetFolder);

            String localFileName = uniqueId + "-" + cleanName;
            Path destination = targetFolder.resolve(localFileName);
            
            // Write AES-256-GCM encrypted bytes to local disk (never plaintext)
            Files.write(destination, encryptedBytes);

            String storageKey = "local:" + folder + "/" + localFileName;
            String fileUrl = "/api/uploads/" + folder + "/" + localFileName;
            log.info("Stored AES-256 encrypted file locally at: {} ({} bytes)", destination, encryptedBytes.length);
            return new StoredFile(fileUrl, storageKey, originalName, mimeType, originalSize, attachmentType, true);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store encrypted file in local storage fallback: " + e.getMessage(), e);
        }
    }

    @Override
    public InputStream loadDecryptedStream(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new IllegalArgumentException("Storage key cannot be blank");
        }

        try {
            InputStream rawStream;
            if (storageKey.startsWith("local:")) {
                String subPath = storageKey.substring(6);
                Path path = localFallbackDir.resolve(subPath);
                if (!Files.exists(path)) {
                    throw new FileNotFoundException("Local file not found at: " + path);
                }
                rawStream = Files.newInputStream(path);
            } else {
                rawStream = minioClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(bucketName)
                                .object(storageKey)
                                .build()
                );
            }

            // Adaptive decryption: handles both ENC1 encrypted envelopes and legacy plaintext streams
            return encryptionService.decryptAdaptiveStream(rawStream);
        } catch (Exception e) {
            log.error("Failed to load and decrypt file stream for key '{}': {}", storageKey, e.getMessage());
            throw new RuntimeException("Error loading decrypted file: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] loadDecryptedBytes(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new IllegalArgumentException("Storage key cannot be blank");
        }

        try {
            byte[] rawBytes;
            if (storageKey.startsWith("local:")) {
                String subPath = storageKey.substring(6);
                Path path = localFallbackDir.resolve(subPath);
                if (!Files.exists(path)) {
                    throw new FileNotFoundException("Local file not found at: " + path);
                }
                rawBytes = Files.readAllBytes(path);
            } else {
                try (InputStream is = minioClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(bucketName)
                                .object(storageKey)
                                .build()
                )) {
                    rawBytes = is.readAllBytes();
                }
            }

            // Adaptive decryption: returns decrypted bytes or legacy plaintext bytes
            return encryptionService.decryptAdaptiveBytes(rawBytes);
        } catch (Exception e) {
            log.error("Failed to load and decrypt bytes for key '{}': {}", storageKey, e.getMessage());
            throw new RuntimeException("Error loading decrypted file bytes: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) return;

        if (storageKey.startsWith("local:")) {
            try {
                String subPath = storageKey.substring(6);
                Path path = localFallbackDir.resolve(subPath);
                Files.deleteIfExists(path);
                log.info("Deleted local file: {}", path);
            } catch (Exception e) {
                log.warn("Failed to delete local file: {}", e.getMessage());
            }
        } else {
            try {
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(storageKey)
                                .build()
                );
                log.info("Deleted MinIO object: {}", storageKey);
            } catch (Exception e) {
                log.warn("Failed to delete MinIO object {}: {}", storageKey, e.getMessage());
            }
        }
    }

    private void cleanUpLocalFileIfExists(String folder, String localFileName) {
        try {
            Path path = localFallbackDir.resolve(folder).resolve(localFileName);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Cleaned up temporary local fallback copy: {}", path);
            }
        } catch (Exception ignored) {}
    }

    private void ensureBucketReady() {
        if (!isMinioAvailable) {
            try {
                boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
                if (!exists) {
                    try {
                        minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                    } catch (Exception ignored) {}
                }
                isMinioAvailable = true;
            } catch (Exception e) {
                log.warn("Notice on checking R2 bucket ready: {}", e.getMessage());
                isMinioAvailable = true;
            }
        }
    }

    private AttachmentType resolveAttachmentType(String mimeType, String extension) {
        String lowerMime = mimeType.toLowerCase(Locale.ROOT);
        String lowerExt = extension.toLowerCase(Locale.ROOT);

        if (lowerMime.startsWith("image/") || lowerExt.matches("jpg|jpeg|png|webp|gif|svg")) {
            return AttachmentType.PHOTO;
        } else if (lowerMime.startsWith("video/") || lowerExt.matches("mp4|mov|avi|mkv|webm")) {
            return AttachmentType.VIDEO;
        } else if (lowerMime.contains("pdf") || lowerMime.contains("document") || lowerMime.contains("msword") || lowerExt.matches("pdf|doc|docx|txt|xlsx|csv")) {
            return AttachmentType.DOCUMENT;
        }
        return AttachmentType.OTHER;
    }

    private String getExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.substring(dot + 1) : "";
    }
}

