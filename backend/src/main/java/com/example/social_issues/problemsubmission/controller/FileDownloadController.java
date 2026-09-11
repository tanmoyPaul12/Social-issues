package com.example.social_issues.problemsubmission.controller;

import com.example.social_issues.problemsubmission.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLConnection;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping
public class FileDownloadController {

    private static final Logger log = LoggerFactory.getLogger(FileDownloadController.class);

    private final FileStorageService fileStorageService;

    public FileDownloadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Intercepts local upload paths (/api/uploads/{folder}/{fileName}) and dynamically
     * decrypts AES-256-GCM encrypted envelopes on the fly for browser rendering.
     */
    @GetMapping("/uploads/{folder}/{fileName:.+}")
    public ResponseEntity<byte[]> streamLocalUpload(
            @PathVariable("folder") String folder,
            @PathVariable("fileName") String fileName
    ) {
        try {
            String storageKey = "local:" + folder + "/" + fileName;
            byte[] decryptedData = fileStorageService.loadDecryptedBytes(storageKey);

            MediaType mediaType = resolveMediaType(fileName);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(decryptedData);
        } catch (Exception e) {
            log.warn("Could not retrieve or decrypt local upload: {}/{} ({})", folder, fileName, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Secure download endpoint by storage key (supports both R2 and local storage).
     */
    @GetMapping("/files/download")
    public ResponseEntity<byte[]> downloadFile(
            @RequestParam("key") String storageKey,
            @RequestParam(value = "name", required = false) String downloadName
    ) {
        try {
            byte[] decryptedData = fileStorageService.loadDecryptedBytes(storageKey);

            String fileName = (downloadName != null && !downloadName.isBlank())
                    ? downloadName
                    : getFileNameFromKey(storageKey);

            MediaType mediaType = resolveMediaType(fileName);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(decryptedData);
        } catch (Exception e) {
            log.error("Failed to download file with key '{}': {}", storageKey, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Inline view endpoint for viewing documents/images by storage key.
     */
    @GetMapping("/files/view")
    public ResponseEntity<byte[]> viewFile(
            @RequestParam("key") String storageKey
    ) {
        try {
            byte[] decryptedData = fileStorageService.loadDecryptedBytes(storageKey);
            String fileName = getFileNameFromKey(storageKey);
            MediaType mediaType = resolveMediaType(fileName);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(decryptedData);
        } catch (Exception e) {
            log.error("Failed to view file with key '{}': {}", storageKey, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private MediaType resolveMediaType(String fileName) {
        String mimeType = URLConnection.guessContentTypeFromName(fileName);
        if (mimeType == null) {
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".pdf")) mimeType = "application/pdf";
            else if (lower.endsWith(".png")) mimeType = "image/png";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mimeType = "image/jpeg";
            else if (lower.endsWith(".webp")) mimeType = "image/webp";
            else if (lower.endsWith(".svg")) mimeType = "image/svg+xml";
            else if (lower.endsWith(".csv")) mimeType = "text/csv";
            else if (lower.endsWith(".json")) mimeType = "application/json";
            else mimeType = "application/octet-stream";
        }
        return MediaType.parseMediaType(mimeType);
    }

    private String getFileNameFromKey(String key) {
        if (key == null) return "downloaded_file";
        int slash = key.lastIndexOf('/');
        return slash >= 0 ? key.substring(slash + 1) : key;
    }
}
