package com.example.social_issues.problemsubmission.service;

import com.example.social_issues.problemsubmission.model.AttachmentType;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    record StoredFile(
            String fileUrl,
            String storageKey,
            String originalFileName,
            String mimeType,
            long sizeBytes,
            AttachmentType attachmentType
    ) {}

    StoredFile storeFile(MultipartFile file, String folderPrefix);

    void deleteFile(String storageKey);
}
