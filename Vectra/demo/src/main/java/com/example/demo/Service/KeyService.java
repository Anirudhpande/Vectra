
package com.example.demo.credentials.service;

import com.example.demo.auth.service.CurrentUserService;
import com.example.demo.credentials.model.API;
import com.example.demo.credentials.dto.ApiRequest;
import com.example.demo.user.model.User;
import com.example.demo.credentials.repository.APIRepository;
import com.example.demo.credentials.encryption.EncryptionService;
import com.example.demo.providers.core.Provider;
import com.example.demo.providers.core.ProviderConfig;
import com.example.demo.providers.core.ProviderRegistry;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KeyService {

    private final APIRepository apiRepository;
    private final CurrentUserService currentUserService;
    private final EncryptionService encryptionService;

    public KeyService(
            APIRepository apiRepository,
            CurrentUserService currentUserService,
            EncryptionService encryptionService
    ) {
        this.apiRepository = apiRepository;
        this.currentUserService = currentUserService;
        this.encryptionService = encryptionService;
    }

    public API registerKey(
            ApiRequest apiRequest,
            Authentication authentication
    ) {

        ProviderConfig config =
                ProviderRegistry.getConfig(apiRequest.getProvider_name());

        User currentUser =
                currentUserService.getCurrentUser(authentication);

        String credentialId = UUID.randomUUID().toString();
        String ownerId = currentUser.getId();

        EncryptionService.EncryptedValue encryptedValue =
                encryptionService.encrypt(
                        apiRequest.getAPI(),
                        credentialId,
                        ownerId
                );

        API api = new API(
                credentialId,
                config.getProviderName(),
                config.getAuthHeader(),
                config.getAuthPrefix(),
                config.getExtraHeaders(),
                encryptedValue.ciphertext(),
                encryptedValue.iv(),
                encryptedValue.keyVersion(),
                ownerId
        );

        return apiRepository.save(api);
    }

    public List<String> getModels(API api) throws Exception {

        Provider provider =
                ProviderRegistry.getProvider(api.getProviderName());

        return provider.getModels(api);
    }

    public List<API> getMyNotes(Authentication authentication) {

        User currentUser =
                currentUserService.getCurrentUser(authentication);

        return apiRepository.findByOwnerId(currentUser.getId());
    }

    public API getMyNotes(
            String id,
            Authentication authentication
    ) {

        User currentUser =
                currentUserService.getCurrentUser(authentication);

        return apiRepository.findByIdAndOwnerId(
                id,
                currentUser.getId()
        ).orElseThrow(
                () -> new IllegalStateException("API not found")
        );
    }

    public List<API> ShowAllApis(Authentication authentication) {
        return getMyNotes(authentication);
    }

    public API exists(
            String id,
            Authentication authentication
    ) {

        User currentUser =
                currentUserService.getCurrentUser(authentication);

        return apiRepository.findByIdAndOwnerId(
                id,
                currentUser.getId()
        ).orElse(null);
    }

    public boolean deleteKey(
            String id,
            Authentication authentication
    ) {

        User currentUser =
                currentUserService.getCurrentUser(authentication);

        API api = apiRepository.findByIdAndOwnerId(
                id,
                currentUser.getId()
        ).orElse(null);

        if (api == null) {
            return false;
        }

        apiRepository.delete(api);
        return true;
    }
}
