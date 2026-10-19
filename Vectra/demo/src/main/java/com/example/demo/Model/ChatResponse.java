package com.example.demo.Model;

import com.example.demo.Service.Providers.ProviderResponse;

public class ChatResponse {

    private final String conversationId;
    private final ProviderResponse providerResponse;

    public ChatResponse(String conversationId, ProviderResponse providerResponse) {
        this.conversationId = conversationId;
        this.providerResponse = providerResponse;
    }

    public String getConversationId() {
        return conversationId;
    }

    public ProviderResponse getProviderResponse() {
        return providerResponse;
    }

    public String getResponse() {
        return providerResponse.getContent();
    }
}
