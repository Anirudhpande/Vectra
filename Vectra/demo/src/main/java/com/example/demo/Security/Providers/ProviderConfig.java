package com.example.demo.Security.Providers;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ProviderConfig {

    private String providerName;
    private String authHeader;
    private String authPrefix;
    private Map<String, String> extraHeaders;

    public ProviderConfig(
            String providerName,
            String authHeader,
            String authPrefix,
            Map<String, String> extraHeaders
    ){
        this.providerName = providerName;
        this.authHeader = authHeader;
        this.authPrefix = authPrefix;
        this.extraHeaders = extraHeaders;
    }

    ProviderConfig(){}

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

    public void setProviderName(String providerName){
        this.providerName = providerName;
    }

    public void setAuthHeader(String authHeader){
        this.authHeader = authHeader;
    }

    public void setAuthPrefix(String authPrefix){
        this.authPrefix = authPrefix;
    }

    public void setExtraHeaders(Map<String, String> extraHeaders){
        this.extraHeaders = extraHeaders;
    }
}
