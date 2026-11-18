
package com.example.demo.credentials.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceCreator;
import org.springframework.data.mongodb.core.mapping.Document;

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

    // AES-GCM encrypted API credential
    private final String API;
    private final String iv;
    private final int keyVersion;

    private final String ownerId;

    @PersistenceCreator
    public API(
            String id,
            String providerName,
            String authHeader,
            String authPrefix,
            Map<String, String> extraHeaders,
            String API,
            String iv,
            int keyVersion,
            String ownerId
    ) {
        this.id = (id == null || id.isBlank())
                ? UUID.randomUUID().toString()
                : id;

        this.providerName = providerName;
        this.authHeader = authHeader;
        this.authPrefix = authPrefix;
        this.extraHeaders = extraHeaders;
        this.API = API;
        this.iv = iv;
        this.keyVersion = keyVersion;
        this.ownerId = ownerId;
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
    public String getOwnerId() {
        return ownerId;
    }

    @JsonIgnore
    public String getAPI() {
        return API;
    }

    @JsonIgnore
    public String getIv() {
        return iv;
    }

    @JsonIgnore
    public int getKeyVersion() {
        return keyVersion;
    }
}
