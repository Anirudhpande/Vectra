package com.example.demo.Service;


import com.example.demo.Model.API;
import com.example.demo.Model.ApiRequest;
import com.example.demo.Model.Provider;
import com.example.demo.Security.KeyManager;
import com.example.demo.Security.Providers.ProviderConfig;
import com.example.demo.Security.Providers.ProviderRegistry;
import com.example.demo.Security.SecurityLogic.Encrypt;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static java.util.Arrays.stream;

@Service
public class KeyService {

    static List<API> apiKeys = new ArrayList<>();

    public static API registerKey(ApiRequest apiRequest) throws Exception {

        KeyManager keyManager = new KeyManager(Encrypt.generateKey());
        SecretKey secretKey = keyManager.getSecretKey();
        String encryptedAPI = keyManager.encrypt(apiRequest.getAPI());

        ProviderConfig config = ProviderRegistry.getConfig(apiRequest.getProvider_name());

        API api = new API(UUID.randomUUID().toString(), config.getProviderName(), config.getAuthHeader(), config.getAuthPrefix(), config.getExtraHeaders(), encryptedAPI, secretKey);
        apiKeys.add(api);
        return api;
    }


    public static List<API> ShowAllApis() {
        return apiKeys;
    }

    public static List<String> getModels(API api) throws Exception {

        Provider provider = ProviderRegistry.getProvider(api.getProviderName());

        return provider.getModels(api);
    }

    public static API exists(String id){
        API api = apiKeys.stream().filter( a-> a.getId().equals(id))
                .findFirst()
                .orElse(null);
        return api;
    }
}
