
package com.example.demo.Service;

import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;
    private static final int KEY_VERSION = 1;

    private final SecretKey masterKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptionService(SecretKey masterEncryptionKey) {
        this.masterKey = masterEncryptionKey;
    }

    public EncryptedValue encrypt(
            String plaintext,
            String credentialId,
            String ownerId) {

        validateIdentity(credentialId, ownerId);

        if (plaintext == null || plaintext.isBlank()) {
            throw new IllegalArgumentException(
                    "Credential cannot be empty."
            );
        }

        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);

            GCMParameterSpec spec =
                    new GCMParameterSpec(TAG_LENGTH, iv);

            cipher.init(Cipher.ENCRYPT_MODE, masterKey, spec);

            cipher.updateAAD(buildAad(credentialId, ownerId));

            byte[] ciphertext = cipher.doFinal(
                    plaintext.getBytes(StandardCharsets.UTF_8)
            );

            return new EncryptedValue(
                    Base64.getEncoder().encodeToString(ciphertext),
                    Base64.getEncoder().encodeToString(iv),
                    KEY_VERSION
            );

        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(
                    "Credential encryption failed.", e
            );
        }
    }

    public String decrypt(
            EncryptedValue encryptedValue,
            String credentialId,
            String ownerId) {


        if (encryptedValue.ciphertext() == null
                || encryptedValue.ciphertext().isBlank()
                || encryptedValue.iv() == null
                || encryptedValue.iv().isBlank()) {

            throw new IllegalArgumentException(
                    "Ciphertext and IV are required."
            );
        }

        validateIdentity(credentialId, ownerId);

        if (encryptedValue.keyVersion() != KEY_VERSION) {
            throw new IllegalArgumentException(
                    "Unsupported encryption key version: "
                            + encryptedValue.keyVersion()
            );
        }

        try {
            byte[] ciphertext =
                    Base64.getDecoder().decode(
                            encryptedValue.ciphertext()
                    );

            byte[] iv =
                    Base64.getDecoder().decode(encryptedValue.iv());

            if (iv.length != IV_LENGTH) {
                throw new IllegalArgumentException(
                        "Invalid encryption IV length."
                );
            }

            Cipher cipher = Cipher.getInstance(ALGORITHM);

            GCMParameterSpec spec =
                    new GCMParameterSpec(TAG_LENGTH, iv);

            cipher.init(Cipher.DECRYPT_MODE, masterKey, spec);

            cipher.updateAAD(buildAad(credentialId, ownerId));

            byte[] plaintext = cipher.doFinal(ciphertext);

            return new String(
                    plaintext,
                    StandardCharsets.UTF_8
            );

        } catch (GeneralSecurityException
                 | IllegalArgumentException e) {

            throw new IllegalStateException(
                    "Credential decryption failed. " +
                            "Data may be tampered with or identity may not match.",
                    e
            );
        }
    }

    private byte[] buildAad(
            String credentialId,
            String ownerId) {

        byte[] credentialBytes =
                credentialId.getBytes(StandardCharsets.UTF_8);

        byte[] ownerBytes =
                ownerId.getBytes(StandardCharsets.UTF_8);

        return ByteBuffer.allocate(
                        8 + credentialBytes.length + ownerBytes.length
                )
                .putInt(credentialBytes.length)
                .put(credentialBytes)
                .putInt(ownerBytes.length)
                .put(ownerBytes)
                .array();
    }

    private void validateIdentity(
            String credentialId,
            String ownerId) {

        if (credentialId == null || credentialId.isBlank()
                || ownerId == null || ownerId.isBlank()) {

            throw new IllegalArgumentException(
                    "Credential ID and owner ID are required."
            );
        }
    }

    public record EncryptedValue(
            String ciphertext,
            String iv,
            int keyVersion
    ) {}
}
