package com.example.demo.Control;


import com.example.demo.Chat.ChatService;
import com.example.demo.Chat.CompactionService;
import com.example.demo.Chat.ConversationStore;
import com.example.demo.Chat.ContextLimitExceededException;
import com.example.demo.Chat.ContextManager;
import com.example.demo.Chat.Modelnfo;
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
    private final ContextManager contextManager;
    private final CompactionService compactionService;

    public ChatController(
            ConversationStore conversationStore,
            ContextManager contextManager,
            CompactionService compactionService
    ) {
        this.conversationStore = conversationStore;
        this.contextManager = contextManager;
        this.compactionService = compactionService;
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

        Modelnfo model;
        try {
            model = provider.getModelInfo(api, request.getModelId());
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Model metadata is unavailable"
            );
        }

        ConversationStore.Conversation conversation = findConversation(request.getConversationId());

        ChatService chatService = new ChatService(
                provider,
                api,
                request.getMessage(),
                contextManager,
                compactionService
        );

        synchronized (conversation) {
            Message userMessage = new Message("user", request.getMessage());
            conversation.addMessage(userMessage);

            try {
                ProviderResponse providerResponse = chatService.sendMessage(model, conversation);

                if (providerResponse == null) {
                    throw new IllegalStateException("Provider returned no response");
                }

                conversation.addMessage(new Message("assistant", providerResponse.getContent()));

                return new ChatResponse(conversation.getId(), providerResponse);
            } catch (ContextLimitExceededException exception) {
                conversation.removeLastMessage(userMessage);
                throw new ResponseStatusException(
                        HttpStatus.CONTENT_TOO_LARGE,
                        "Conversation exceeds the model context limit"
                );
            } catch (Exception exception) {
                conversation.removeLastMessage(userMessage);
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Provider request failed"
                );
            }
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
