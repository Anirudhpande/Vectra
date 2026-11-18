
package com.example.demo.credentials.encryption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class EncryptionConfig {

    @Bean
    public SecretKey masterEncryptionKey(
            @Value("${MASTER_ENCRYPTION_KEY:}") String encodedKey) {


        System.out.println(
                "MASTER KEY STATUS: " +
                        (encodedKey == null || encodedKey.isBlank() ? "MISSING" : "PRESENT")
        );

        if (encodedKey == null || encodedKey.isBlank()) {
            throw new IllegalStateException(
                    "MASTER_ENCRYPTION_KEY is missing. Application cannot start."
            );
        }

        final byte[] keyBytes;

        try {
            keyBytes = Base64.getDecoder().decode(encodedKey.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "MASTER_ENCRYPTION_KEY is not valid Base64.", e
            );
        }

        if (keyBytes.length != 32) {
            throw new IllegalStateException(
                    "MASTER_ENCRYPTION_KEY must decode to exactly 32 bytes."
            );
        }

        return new SecretKeySpec(keyBytes, "AES");
    }
}
