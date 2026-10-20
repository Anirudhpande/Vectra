
package com.example.demo.Control;

import com.example.demo.Chat.ChatService;
import com.example.demo.Chat.CompactionService;
import com.example.demo.Chat.ConversationStore;
import com.example.demo.Chat.ContextLimitExceededException;
import com.example.demo.Chat.ContextManager;
import com.example.demo.Chat.ConversationSummary;
import com.example.demo.Chat.Modelnfo;
import com.example.demo.Model.API;
import com.example.demo.Model.ChatRequest;
import com.example.demo.Model.ChatResponse;
import com.example.demo.Model.Message;
import com.example.demo.Service.KeyService;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderRegistry;
import com.example.demo.Service.Providers.ProviderResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class ChatController {

    private static final Logger log =
            LoggerFactory.getLogger(ChatController.class);

    private final ConversationStore conversationStore;
    private final ContextManager contextManager;
    private final CompactionService compactionService;
    private final KeyService keyService;

    public ChatController(
            ConversationStore conversationStore,
            ContextManager contextManager,
            CompactionService compactionService,
            KeyService keyService
    ) {
        this.conversationStore = conversationStore;
        this.contextManager = contextManager;
        this.compactionService = compactionService;
        this.keyService = keyService;
    }

    @PostMapping("/api/chats")
    public ChatResponse sendMessage(
            @RequestBody ChatRequest request
    ) {

        // Validate request
        if (request == null
                || isBlank(request.getCredentialId())
                || isBlank(request.getModelId())
                || isBlank(request.getMessage())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "credentialId, modelId, and message are required"
            );
        }

        // Find API credential
        API api = keyService.exists(request.getCredentialId());

        if (api == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Credential not found"
            );
        }

        // Find provider
        Provider provider;

        try {
            provider = ProviderRegistry.getProvider(
                    api.getProviderName()
            );
        } catch (IllegalArgumentException exception) {
            log.error(
                    "Unsupported provider: {}",
                    api.getProviderName(),
                    exception
            );

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported provider for credential"
            );
        }

        // Retrieve model metadata
        Modelnfo model;

        try {
            model = provider.getModelInfo(
                    api,
                    request.getModelId()
            );
        } catch (Exception exception) {
            log.error(
                    "Failed to retrieve model metadata for modelId={}",
                    request.getModelId(),
                    exception
            );

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Model metadata is unavailable"
            );
        }

        // Find existing conversation or create a new one
        ConversationStore.Conversation conversation =
                findConversation(request.getConversationId());

        ChatService chatService = new ChatService(
                provider,
                api,
                request.getMessage(),
                contextManager,
                compactionService
        );

        synchronized (conversation) {

            Message userMessage = new Message(
                    "user",
                    request.getMessage()
            );

            conversation.addMessage(userMessage);

            try {
                ProviderResponse providerResponse =
                        chatService.sendMessage(model, conversation);

                if (providerResponse == null) {
                    throw new IllegalStateException(
                            "Provider returned no response"
                    );
                }

                conversation.addMessage(
                        new Message(
                                "assistant",
                                providerResponse.getContent()
                        )
                );

                return new ChatResponse(
                        conversation.getId(),
                        providerResponse
                );

            } catch (ContextLimitExceededException exception) {

                log.warn(
                        "Context limit exceeded for conversationId={}",
                        conversation.getId(),
                        exception
                );

                conversation.removeLastMessage(userMessage);

                throw new ResponseStatusException(
                        HttpStatus.CONTENT_TOO_LARGE,
                        "Conversation exceeds the model context limit"
                );

            } catch (Exception exception) {

                log.error(
                        "Provider request failed for modelId={}, conversationId={}",
                        request.getModelId(),
                        conversation.getId(),
                        exception
                );

                conversation.removeLastMessage(userMessage);

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Provider request failed"
                );
            }
        }
    }

    private ConversationStore.Conversation findConversation(
            String conversationId
    ) {
        if (isBlank(conversationId)) {
            return conversationStore.createConversation();
        }

        ConversationStore.Conversation conversation =
                conversationStore.getConversation(conversationId);

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

    @GetMapping("/api/chats")
    public List<ConversationSummary> getConversations() {
        return conversationStore.getAllConversations();
    }

    @GetMapping("/api/chats/{conversationId}/messages")
    public List<Message> getMessages(
            @PathVariable String conversationId
    ) {
        List<Message> messages =
                conversationStore.getMessages(conversationId);

        if (messages == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Conversation not found"
            );
        }

        return messages;
    }

    @DeleteMapping("/api/chats/{conversationId}")
    public void deleteConversation(
            @PathVariable String conversationId
    ) {
        boolean deleted =
                conversationStore.deleteConversation(conversationId);

        if (!deleted) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Conversation not found"
            );
        }
    }
}
