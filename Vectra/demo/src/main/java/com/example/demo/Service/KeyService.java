
package com.example.demo.Service;

import com.example.demo.Model.API;
import com.example.demo.Model.ApiRequest;
import com.example.demo.Model.User;
import com.example.demo.Repository.APIRepository;
import com.example.demo.Security.KeyManager;
import com.example.demo.Security.SecurityLogic.Encrypt;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderConfig;
import com.example.demo.Service.Providers.ProviderRegistry;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.List;
import java.util.UUID;

@Service
public class KeyService {

    private final APIRepository apiRepository;
    private final CurrentUserSerivce currentUserService;

    public KeyService(
            APIRepository apiRepository,
            CurrentUserSerivce currentUserService)
    {
        this.currentUserService = currentUserService;
        this.apiRepository = apiRepository;
    }

    public API registerKey(ApiRequest apiRequest, org.springframework.security.core.Authentication authentication) throws Exception {

        KeyManager keyManager = new KeyManager(Encrypt.generateKey());

        SecretKey secretKey = keyManager.getSecretKey();
        String encryptedAPI = keyManager.encrypt(apiRequest.getAPI());

        ProviderConfig config =
                ProviderRegistry.getConfig(apiRequest.getProvider_name());

        User currentUser = currentUserService.getCurrentUser(authentication);

        API api = new API(
                UUID.randomUUID().toString(),
                config.getProviderName(),
                config.getAuthHeader(),
                config.getAuthPrefix(),
                config.getExtraHeaders(),
                encryptedAPI,
                secretKey,
                currentUser.getId()
        );

        return apiRepository.save(api);
    }

    public List<API> ShowAllApis() {
        return apiRepository.findAll();
    }

    public List<String> getModels(API api) throws Exception {
        Provider provider =
                ProviderRegistry.getProvider(api.getProviderName());

        return provider.getModels(api);
    }

    public API exists(String id) {
        return apiRepository.findById(id).orElse(null);
    }

    public List<API> getMyNotes(
            org.springframework.security.core.Authentication authentication) {

        User currentUser = currentUserService.getCurrentUser(authentication);

        return apiRepository.findByOwnerId(currentUser.getId());
    }

    public API getMyNotes(String id, org.springframework.security.core.Authentication authentication){

        User currentUser = currentUserService.getCurrentUser(authentication);

        return apiRepository.findByIdAndOwnerId(id, currentUser.getId())
                .orElseThrow(()-> new IllegalStateException(
                        "API not found"
                ));
    }
}
