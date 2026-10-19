package com.example.demo.Control;


import com.example.demo.Chat.ChatService;
import com.example.demo.Chat.ConversationStore;
import com.example.demo.Model.API;
import com.example.demo.Model.ChatRequest;
import com.example.demo.Model.ChatResponse;
import com.example.demo.Model.Message;
import com.example.demo.Service.KeyService;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderRegistry;
import com.example.demo.Service.Providers.ProviderResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ChatController {

    private final ConversationStore conversationStore;

    public ChatController(ConversationStore conversationStore) {
        this.conversationStore = conversationStore;
    }

    @PostMapping("/api/chats")
    public ChatResponse sendMessage(
            @RequestBody ChatRequest request
    ) throws Exception {

        if (request == null
                || isBlank(request.getCredentialId())
                || isBlank(request.getModelId())
                || isBlank(request.getMessage())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "credentialId, modelId, and message are required"
            );
        }

        API api = KeyService.exists(request.getCredentialId());

        if (api == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Credential not found"
            );
        }

        Provider provider;
        try {
            provider = ProviderRegistry.getProvider(api.getProviderName());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported provider for credential"
            );
        }

        ConversationStore.Conversation conversation = findConversation(request.getConversationId());

        ChatService chatService = new ChatService(
                provider,
                api,
                request.getMessage()
        );

        synchronized (conversation) {
            conversation.addMessage(new Message("user", request.getMessage()));

            ProviderResponse providerResponse = chatService.sendMessage(
                    request.getModelId(),
                    conversation.getMessages()
            );

            if (providerResponse == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Provider returned no response"
                );
            }

            conversation.addMessage(new Message("assistant", providerResponse.getContent()));

            return new ChatResponse(conversation.getId(), providerResponse);
        }
    }

    private ConversationStore.Conversation findConversation(String conversationId) {
        if (isBlank(conversationId)) {
            return conversationStore.createConversation();
        }

        ConversationStore.Conversation conversation = conversationStore.getConversation(conversationId);
        if (conversation == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Conversation not found"
            );
        }
        return conversation;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
