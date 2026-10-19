package com.example.demo.Chat;

public class Modelnfo {
    private String provider;
    private String modelId;
    private long maxContextTokens;
    private long maxOutputTokens;

    public Modelnfo(
            String provider,
            String modelId,
            long maxContextTokens,
            long maxOutputTokens
    ){
        this.provider = provider;
        this.modelId = modelId;
        this.maxContextTokens = maxContextTokens;
        this.maxOutputTokens = maxOutputTokens;
    }

    Modelnfo(){}

    public String getProvider() {
        return provider;
    }

    public String getModelId() {
        return modelId;
    }

    public long getMaxContextTokens() {
        return maxContextTokens;
    }

    public long getMaxOutputTokens() {
        return maxOutputTokens;
    }

    public void setProvider(String provider){
        this.provider = provider;
    }

    public void setModelId (String modelId){
        this.modelId = modelId;
    }

    public void setMaxContextTokens(long maxContextTokens){
        this.maxContextTokens = maxContextTokens;
    }

    public void setMaxOutputTokens(long maxOutputTokens){
        this.maxOutputTokens = maxOutputTokens;
    }
}
