
package com.example.demo.Chat;

import com.example.demo.Model.API;
import com.example.demo.Model.Message;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderResponse;

import java.util.ArrayList;
import java.util.List;

public class ChatService {

    private final Provider provider;
    private final API api;
    private final String message;
    private final ContextManager contextManager;
    private final CompactionService compactionService;

    public ChatService(
            Provider provider,
            API api,
            String message
    ) {
        this(provider, api, message, null, null);
    }

    public ChatService(
            Provider provider,
            API api,
            String message,
            ContextManager contextManager,
            CompactionService compactionService
    ) {
        this.provider = provider;
        this.api = api;
        this.message = message;
        this.contextManager = contextManager;
        this.compactionService = compactionService;
    }

    public ProviderResponse sendMessage(String selectedModel)
            throws Exception {

        List<Message> messages = new ArrayList<>();
        messages.add(new Message("user", message));

        return sendMessage(selectedModel, messages);
    }

    public ProviderResponse sendMessage(
            String selectedModel,
            List<Message> messages
    ) throws Exception {

        return provider.sendRequest(
                api,
                selectedModel,
                messages
        );
    }

    public ProviderResponse sendMessage(
            Modelnfo model,
            ConversationStore.Conversation conversation
    ) throws Exception {

        if (contextManager == null || compactionService == null) {
            throw new IllegalStateException(
                    "Context management is not configured"
            );
        }

        if (model == null || conversation == null) {
            throw new IllegalArgumentException(
                    "Model and conversation are required"
            );
        }

        List<Message> context =
                conversation.getMessagesWithSummary();

        var budget = contextManager.calculateBudget(model, context);

        // Attempt compaction when the configured threshold is reached.
        if (budget.shouldCompact()) {

            Summarizer summarizer = new ProviderSummarizer(
                    provider,
                    api,
                    model.getModelId()
            );

            boolean compacted = compactionService.compact(
                    conversation,
                    model.getModelId(),
                    budget.getAvailableInputTokens() / 2,
                    budget.getAvailableInputTokens(),
                    summarizer
            );

            // Always reload the persisted context after the attempt.
            context = conversation.getMessagesWithSummary();
            budget = contextManager.calculateBudget(model, context);

            if (!compacted
                    && budget.getEstimatedInputTokens()
                    > budget.getAvailableInputTokens()) {

                throw new ContextLimitExceededException(
                        "Compaction could not reduce the conversation "
                                + "enough. Estimated input tokens: "
                                + budget.getEstimatedInputTokens()
                                + ", available input tokens: "
                                + budget.getAvailableInputTokens()
                );
            }
        }

        // Final safety check before sending the request to the provider.
        if (budget.getEstimatedInputTokens()
                > budget.getAvailableInputTokens()) {

            throw new ContextLimitExceededException(
                    "Conversation exceeds the model input budget. "
                            + "Estimated input tokens: "
                            + budget.getEstimatedInputTokens()
                            + ", available input tokens: "
                            + budget.getAvailableInputTokens()
            );
        }

        return sendMessage(model.getModelId(), context);
    }
}
