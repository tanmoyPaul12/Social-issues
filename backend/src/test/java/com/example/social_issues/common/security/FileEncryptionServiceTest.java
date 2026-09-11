package com.example.social_issues.common.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

class FileEncryptionServiceTest {

    private FileEncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new FileEncryptionService();
        ReflectionTestUtils.setField(encryptionService, "encryptionEnabled", true);
        ReflectionTestUtils.setField(encryptionService, "rawSecretKey", "TestSecretKeyForJharkhandPortalAES256!");
        encryptionService.init();
    }

    @Test
    void testEncryptAndDecryptBytesRoundTrip() {
        String originalText = "Sensitive Patent Blueprint CAD & Citizen PII Data for Jharkhand State Innovation";
        byte[] plaintextBytes = originalText.getBytes(StandardCharsets.UTF_8);

        byte[] encryptedBytes = encryptionService.encryptBytes(plaintextBytes);

        // Verify structure: Magic Header ENC1
        assertNotNull(encryptedBytes);
        assertTrue(encryptedBytes.length > plaintextBytes.length);
        assertTrue(encryptionService.isEncryptedEnvelope(encryptedBytes));
        assertArrayEquals(FileEncryptionService.MAGIC_HEADER, Arrays.copyOfRange(encryptedBytes, 0, 4));

        // Decrypt
        byte[] decryptedBytes = encryptionService.decryptAdaptiveBytes(encryptedBytes);
        String decryptedText = new String(decryptedBytes, StandardCharsets.UTF_8);

        assertEquals(originalText, decryptedText);
    }

    @Test
    void testLegacyUnencryptedFilePassThrough() {
        // Sample legacy PDF header and content (not starting with ENC1)
        String legacyPdfContent = "%PDF-1.4\n1 0 obj\n<< /Title (Legacy Proposal) >>\nendobj\n%%EOF";
        byte[] legacyBytes = legacyPdfContent.getBytes(StandardCharsets.UTF_8);

        assertFalse(encryptionService.isEncryptedEnvelope(legacyBytes));

        // Adaptive decrypt on legacy file should return identical bytes without error
        byte[] resultBytes = encryptionService.decryptAdaptiveBytes(legacyBytes);
        assertEquals(legacyPdfContent, new String(resultBytes, StandardCharsets.UTF_8));
    }

    @Test
    void testStreamingDecryptionRoundTrip() throws Exception {
        String testContent = "IoT Ground Sensor Telemetry Log: Turbidity 0.4 NTU, Coliforms 0 CFU, Flow 140 L/hr";
        byte[] encryptedBytes = encryptionService.encryptBytes(testContent.getBytes(StandardCharsets.UTF_8));

        try (InputStream stream = new ByteArrayInputStream(encryptedBytes);
             InputStream decryptedStream = encryptionService.decryptAdaptiveStream(stream)) {

            byte[] decryptedBytes = decryptedStream.readAllBytes();
            assertEquals(testContent, new String(decryptedBytes, StandardCharsets.UTF_8));
        }
    }

    @Test
    void testLegacyStreamingPassThrough() throws Exception {
        String legacyContent = "Legacy Plaintext Document uploaded before encryption was turned on.";
        byte[] legacyBytes = legacyContent.getBytes(StandardCharsets.UTF_8);

        try (InputStream stream = new ByteArrayInputStream(legacyBytes);
             InputStream passThroughStream = encryptionService.decryptAdaptiveStream(stream)) {

            byte[] resultBytes = passThroughStream.readAllBytes();
            assertEquals(legacyContent, new String(resultBytes, StandardCharsets.UTF_8));
        }
    }
}
