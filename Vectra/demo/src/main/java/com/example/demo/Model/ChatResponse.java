package com.example.demo.Model;

import com.example.demo.Service.Providers.ProviderResponse;

public class ChatResponse {

    private final String conversationId;
    private final String title;
    private final ProviderResponse providerResponse;

    public ChatResponse(
            String conversationId,
            String title,
            ProviderResponse providerResponse
    ) {
        this.conversationId = conversationId;
        this.title = title;
        this.providerResponse = providerResponse;
    }

    public String getConversationId() {
        return conversationId;
    }

    public String getTitle() {
        return title;
    }

    public ProviderResponse getProviderResponse() {
        return providerResponse;
    }

    public String getResponse() {
        return providerResponse.getContent();
    }
}
