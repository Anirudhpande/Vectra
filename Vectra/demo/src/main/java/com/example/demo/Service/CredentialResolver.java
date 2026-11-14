
package com.example.demo.Service;

import com.example.demo.Model.API;
import com.example.demo.Service.EncryptionService;
import org.springframework.stereotype.Service;

@Service
public class CredentialResolver {

    private final EncryptionService encryptionService;

    public CredentialResolver(EncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }

    public String decryptApiKey(API api) {

        if (api == null) {
            throw new IllegalArgumentException(
                    "API credential is required."
            );
        }

        EncryptionService.EncryptedValue encryptedValue =
                new EncryptionService.EncryptedValue(
                        api.getAPI(),
                        api.getIv(),
                        api.getKeyVersion()
                );

        return encryptionService.decrypt(
                encryptedValue,
                api.getId(),
                api.getOwnerId()
        );
    }
}
