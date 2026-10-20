
package com.example.demo.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceCreator;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Document(collection = "api_credentials")
public class API {

    @Id
    private String id;

    private final String providerName;
    private final String authHeader;
    private final String authPrefix;
    private final Map<String, String> extraHeaders;
    private final String API;
    private final String secretKey;

    // Constructor for registering a new API credential
    public API(
            String id,
            String providerName,
            String authHeader,
            String authPrefix,
            Map<String, String> extraHeaders,
            String API,
            SecretKey secretKey
    ) {
        this.id = (id == null || id.isBlank())
                ? UUID.randomUUID().toString()
                : id;

        this.providerName = providerName;
        this.authHeader = authHeader;
        this.authPrefix = authPrefix;
        this.extraHeaders = extraHeaders;
        this.API = API;
        this.secretKey = Base64.getEncoder()
                .encodeToString(secretKey.getEncoded());
    }

    // Constructor used by Spring Data MongoDB
    @PersistenceCreator
    public API(
            String id,
            String providerName,
            String authHeader,
            String authPrefix,
            Map<String, String> extraHeaders,
            String API,
            String secretKey
    ) {
        this.id = id;
        this.providerName = providerName;
        this.authHeader = authHeader;
        this.authPrefix = authPrefix;
        this.extraHeaders = extraHeaders;
        this.API = API;
        this.secretKey = secretKey;
    }

    public String getId() {
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

    @JsonIgnore
    public String getAPI() {
        return API;
    }

    @JsonIgnore
    public SecretKey getSecretKey() {
        byte[] decodedKey = Base64.getDecoder()
                .decode(secretKey);

        return new SecretKeySpec(decodedKey, "AES");
    }
}
