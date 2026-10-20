
package com.example.demo.Service;

import com.example.demo.Model.API;
import com.example.demo.Model.ApiRequest;
import com.example.demo.Repository.APIRepository;
import com.example.demo.Security.KeyManager;
import com.example.demo.Security.SecurityLogic.Encrypt;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderConfig;
import com.example.demo.Service.Providers.ProviderRegistry;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.List;
import java.util.UUID;

@Service
public class KeyService {

    private final APIRepository apiRepository;

    public KeyService(APIRepository apiRepository) {
        this.apiRepository = apiRepository;
    }

    public API registerKey(ApiRequest apiRequest) throws Exception {

        KeyManager keyManager = new KeyManager(Encrypt.generateKey());

        SecretKey secretKey = keyManager.getSecretKey();
        String encryptedAPI = keyManager.encrypt(apiRequest.getAPI());

        ProviderConfig config =
                ProviderRegistry.getConfig(apiRequest.getProvider_name());

        API api = new API(
                UUID.randomUUID().toString(),
                config.getProviderName(),
                config.getAuthHeader(),
                config.getAuthPrefix(),
                config.getExtraHeaders(),
                encryptedAPI,
                secretKey
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
}
