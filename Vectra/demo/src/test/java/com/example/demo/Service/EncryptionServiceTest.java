
package com.example.demo.Service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionServiceTest {

    private EncryptionService encryptionService;

    private static final String CREDENTIAL_ID = "credential-123";
    private static final String OWNER_ID = "user-456";
    private static final String API_KEY = "test-api-key-123";

    @BeforeEach
    void setUp() {
        byte[] keyBytes = new byte[32];

        for (int i = 0; i < keyBytes.length; i++) {
            keyBytes[i] = (byte) i;
        }

        SecretKeySpec masterKey =
                new SecretKeySpec(keyBytes, "AES");

        encryptionService = new EncryptionService(masterKey);
    }

    @Test
    void shouldEncryptAndDecryptSuccessfully() {
        EncryptionService.EncryptedValue encrypted =
                encryptionService.encrypt(
                        API_KEY,
                        CREDENTIAL_ID,
                        OWNER_ID
                );

        String decrypted = encryptionService.decrypt(
                encrypted,
                CREDENTIAL_ID,
                OWNER_ID
        );

        assertEquals(API_KEY, decrypted);
    }

    @Test
    void shouldGenerateDifferentIVsForEachEncryption() {
        EncryptionService.EncryptedValue first =
                encryptionService.encrypt(
                        API_KEY,
                        CREDENTIAL_ID,
                        OWNER_ID
                );

        EncryptionService.EncryptedValue second =
                encryptionService.encrypt(
                        API_KEY,
                        CREDENTIAL_ID,
                        OWNER_ID
                );

        assertNotEquals(first.iv(), second.iv());
    }

    @Test
    void shouldRejectTamperedCiphertext() {
        EncryptionService.EncryptedValue encrypted =
                encryptionService.encrypt(
                        API_KEY,
                        CREDENTIAL_ID,
                        OWNER_ID
                );

        byte[] ciphertext =
                Base64.getDecoder().decode(encrypted.ciphertext());

        ciphertext[0] ^= 1;

        String tamperedCiphertext =
                Base64.getEncoder().encodeToString(ciphertext);

        EncryptionService.EncryptedValue tampered =
                new EncryptionService.EncryptedValue(
                        tamperedCiphertext,
                        encrypted.iv(),
                        encrypted.keyVersion()
                );

        assertThrows(
                IllegalStateException.class,
                () -> encryptionService.decrypt(
                        tampered,
                        CREDENTIAL_ID,
                        OWNER_ID
                )
        );
    }

    @Test
    void shouldRejectWrongCredentialId() {
        EncryptionService.EncryptedValue encrypted =
                encryptionService.encrypt(
                        API_KEY,
                        CREDENTIAL_ID,
                        OWNER_ID
                );

        assertThrows(
                IllegalStateException.class,
                () -> encryptionService.decrypt(
                        encrypted,
                        "another-credential",
                        OWNER_ID
                )
        );
    }

    @Test
    void shouldRejectWrongOwner() {
        EncryptionService.EncryptedValue encrypted =
                encryptionService.encrypt(
                        API_KEY,
                        CREDENTIAL_ID,
                        OWNER_ID
                );

        assertThrows(
                IllegalStateException.class,
                () -> encryptionService.decrypt(
                        encrypted,
                        CREDENTIAL_ID,
                        "another-user"
                )
        );
    }

    @Test
    void shouldRejectUnsupportedKeyVersion() {
        EncryptionService.EncryptedValue encrypted =
                encryptionService.encrypt(
                        API_KEY,
                        CREDENTIAL_ID,
                        OWNER_ID
                );

        EncryptionService.EncryptedValue unsupportedVersion =
                new EncryptionService.EncryptedValue(
                        encrypted.ciphertext(),
                        encrypted.iv(),
                        999
                );

        assertThrows(
                IllegalArgumentException.class,
                () -> encryptionService.decrypt(
                        unsupportedVersion,
                        CREDENTIAL_ID,
                        OWNER_ID
                )
        );
    }
}
