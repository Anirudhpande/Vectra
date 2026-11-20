package com.example.demo.chat.dto;

import java.util.ArrayList;
import java.util.List;

public class ChatRequest {

    private String credentialId;
    private String modelId;
    private String conversationId;
    private String message;
    public List<String> attachmentIds = new ArrayList<>();

    public String getCredentialId() {
        return credentialId;
    }

    public void setCredentialId(String credentialId) {
        this.credentialId = credentialId;
    }

    public String getModelId() {
        return modelId;
    }

    public void setModelId(String modelId) {
        this.modelId = modelId;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getAttachmentIds(){
        return attachmentIds;
    }

    public void setAttachmentIds(List<String> attachmentIds){
        this.attachmentIds = attachmentIds;
    }
}
