package com.example.demo.chat.dto;

import com.example.demo.providers.core.ProviderResponse;

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
