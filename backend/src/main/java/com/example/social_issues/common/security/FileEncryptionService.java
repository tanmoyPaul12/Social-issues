package com.example.social_issues.common.security;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Arrays;

/**
 * Enterprise Application-Level Envelope Encryption Service.
 * Implements AES-256-GCM authenticated encryption with the self-describing
 * magic header 'ENC1' for seamless backward-compatible dual-mode decryption.
 */
@Service
public class FileEncryptionService {

    private static final Logger log = LoggerFactory.getLogger(FileEncryptionService.class);

    // 4-byte Magic Header identifying AES-256-GCM envelope v1
    public static final byte[] MAGIC_HEADER = new byte[] { 0x45, 0x4E, 0x43, 0x01 }; // 'E', 'N', 'C', 0x01
    public static final int HEADER_LENGTH = MAGIC_HEADER.length; // 4 bytes
    public static final int GCM_IV_LENGTH = 12; // 12 bytes recommended for GCM
    public static final int GCM_TAG_LENGTH_BITS = 128; // 128-bit authentication tag
    public static final int GCM_TAG_LENGTH_BYTES = GCM_TAG_LENGTH_BITS / 8; // 16 bytes

    private static final String ALGORITHM = "AES";
    private static final String CIPHER_TRANSFORMATION = "AES/GCM/NoPadding";

    @Value("${app.encryption.enabled:true}")
    private boolean encryptionEnabled;

    @Value("${app.encryption.secret-key:JharkhandInnovationPortalAES256Key2026!}")
    private String rawSecretKey;

    private SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void init() {
        try {
            // Derive a 256-bit (32-byte) key deterministically using SHA-256
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(rawSecretKey.getBytes(StandardCharsets.UTF_8));
            this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
            log.info("FileEncryptionService initialized: AES-256-GCM Envelope Encryption is {}",
                    encryptionEnabled ? "ENABLED" : "DISABLED (Pass-through)");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available for key derivation", e);
        }
    }

    public boolean isEncryptionEnabled() {
        return encryptionEnabled;
    }

    public record EncryptedPayload(
            byte[] data,
            long sizeBytes
    ) {}

    /**
     * Encrypts plaintext bytes with AES-256-GCM and prepends [ENC1] + [IV].
     */
    public byte[] encryptBytes(byte[] plaintext) {
        if (!encryptionEnabled || plaintext == null || plaintext.length == 0) {
            return plaintext;
        }

        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

            byte[] ciphertext = cipher.doFinal(plaintext);

            // Structure: [MAGIC_HEADER (4B)] + [IV (12B)] + [CIPHERTEXT + TAG]
            ByteArrayOutputStream baos = new ByteArrayOutputStream(HEADER_LENGTH + GCM_IV_LENGTH + ciphertext.length);
            baos.write(MAGIC_HEADER);
            baos.write(iv);
            baos.write(ciphertext);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to encrypt file bytes: {}", e.getMessage(), e);
            throw new RuntimeException("Encryption failure: " + e.getMessage(), e);
        }
    }

    /**
     * Encrypts an incoming InputStream into an encrypted ByteArray / byte buffer
     * prepended with [ENC1] + [IV].
     */
    public EncryptedPayload encryptInputStream(InputStream plaintextStream, long originalSize) {
        if (!encryptionEnabled) {
            try {
                byte[] raw = plaintextStream.readAllBytes();
                return new EncryptedPayload(raw, raw.length);
            } catch (IOException e) {
                throw new RuntimeException("Failed to read plaintext stream", e);
            }
        }

        try {
            byte[] plaintext = plaintextStream.readAllBytes();
            byte[] encrypted = encryptBytes(plaintext);
            return new EncryptedPayload(encrypted, encrypted.length);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read input stream for encryption", e);
        }
    }

    /**
     * Decrypts stored bytes adaptively:
     * - If starts with 'ENC1': Decrypts using AES-256-GCM.
     * - If does NOT start with 'ENC1': Returns storedBytes as plaintext (legacy backward-compatible).
     */
    public byte[] decryptAdaptiveBytes(byte[] storedBytes) {
        if (storedBytes == null || storedBytes.length < (HEADER_LENGTH + GCM_IV_LENGTH + GCM_TAG_LENGTH_BYTES)) {
            // Cannot be an ENC1 encrypted file; return as-is
            return storedBytes;
        }

        if (!isEncryptedEnvelope(storedBytes)) {
            // Legacy / plaintext file; return without modification
            return storedBytes;
        }

        try {
            // Extract IV (bytes 4 to 15)
            byte[] iv = Arrays.copyOfRange(storedBytes, HEADER_LENGTH, HEADER_LENGTH + GCM_IV_LENGTH);
            // Extract Ciphertext (bytes 16 to end)
            byte[] ciphertext = Arrays.copyOfRange(storedBytes, HEADER_LENGTH + GCM_IV_LENGTH, storedBytes.length);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

            return cipher.doFinal(ciphertext);
        } catch (Exception e) {
            log.warn("Failed to decrypt envelope with ENC1 header: {}. Falling back to raw bytes.", e.getMessage());
            return storedBytes;
        }
    }

    /**
     * Adaptively wraps an InputStream for streaming decryption:
     * - If first 4 bytes match 'ENC1': Decrypts stream dynamically on the fly.
     * - If first 4 bytes do NOT match: Rewinds the stream and returns pure plaintext.
     */
    public InputStream decryptAdaptiveStream(InputStream storedStream) throws IOException {
        if (storedStream == null) {
            return null;
        }

        BufferedInputStream bis = new BufferedInputStream(storedStream, 64 * 1024);
        bis.mark(HEADER_LENGTH + GCM_IV_LENGTH + 8);

        byte[] header = new byte[HEADER_LENGTH];
        int read = bis.read(header);

        if (read == HEADER_LENGTH && Arrays.equals(header, MAGIC_HEADER)) {
            // Encrypted envelope detected!
            byte[] iv = new byte[GCM_IV_LENGTH];
            int ivRead = bis.read(iv);
            if (ivRead == GCM_IV_LENGTH) {
                try {
                    Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
                    GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
                    cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

                    return new CipherInputStream(bis, cipher);
                } catch (Exception e) {
                    log.error("Cipher init error during streaming decryption: {}", e.getMessage(), e);
                    bis.reset();
                    return bis;
                }
            }
        }

        // Not encrypted (or truncated header) -> reset and return plain stream
        bis.reset();
        return bis;
    }

    /**
     * Checks if a byte buffer begins with the 'ENC1' magic signature.
     */
    public boolean isEncryptedEnvelope(byte[] buffer) {
        if (buffer == null || buffer.length < HEADER_LENGTH) {
            return false;
        }
        for (int i = 0; i < HEADER_LENGTH; i++) {
            if (buffer[i] != MAGIC_HEADER[i]) {
                return false;
            }
        }
        return true;
    }
}
