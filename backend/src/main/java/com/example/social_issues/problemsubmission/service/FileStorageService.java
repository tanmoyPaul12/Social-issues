package com.example.social_issues.problemsubmission.service;

import com.example.social_issues.problemsubmission.model.AttachmentType;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface FileStorageService {

    record StoredFile(
            String fileUrl,
            String storageKey,
            String originalFileName,
            String mimeType,
            long sizeBytes,
            AttachmentType attachmentType,
            boolean isEncrypted
    ) {
        public StoredFile(String fileUrl, String storageKey, String originalFileName, String mimeType, long sizeBytes, AttachmentType attachmentType) {
            this(fileUrl, storageKey, originalFileName, mimeType, sizeBytes, attachmentType, true);
        }
    }

    StoredFile storeFile(MultipartFile file, String folderPrefix);

    InputStream loadDecryptedStream(String storageKey);

    byte[] loadDecryptedBytes(String storageKey);

    void deleteFile(String storageKey);
}

