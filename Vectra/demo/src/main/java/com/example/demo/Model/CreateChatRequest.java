package com.example.demo.Model;

public class CreateChatRequest {

    private String credentialId;
    private String modelId;

    public void setCredentialId(String credentialId) {
        this.credentialId = credentialId;
    }

    public String getCredentialId(){
        return credentialId;
    }

    public void setModelId(String modelId) {
        this.modelId = modelId;
    }

    public String getModelId() {
        return modelId;
    }
}
