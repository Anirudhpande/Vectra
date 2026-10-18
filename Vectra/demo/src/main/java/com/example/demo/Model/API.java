package com.example.demo.Model;
import javax.crypto.SecretKey;
import java.util.Map;
import java.util.UUID;

public class API {

    private String id;
    private final String providerName;
    private final String authHeader;
    private final String authPrefix;
    private final Map<String, String> extraHeaders;
    private final String API;
    private final SecretKey secretKey;

    public API(
            String id,
            String providerName,
            String authHeader,
            String authPrefix,
            Map<String, String> extraHeaders,
            String API,
            SecretKey secretKey
    ){
        this.id = UUID.randomUUID().toString();
        this.providerName = providerName;
        this.authHeader = authHeader;
        this.authPrefix = authPrefix;
        this.extraHeaders = extraHeaders;
        this.API = API;
        this.secretKey = secretKey;
    }

    public String getId(){
        return id;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getAuthHeader() {
        return authHeader;
    }

    public String getAuthPrefix() {
        return authPrefix;
    }

    public Map<String, String> getExtraHeaders() {
        return extraHeaders;
    }

    public String getAPI() {
        return API;
    }

    public SecretKey getSecretKey() {
        return secretKey;
    }


}
