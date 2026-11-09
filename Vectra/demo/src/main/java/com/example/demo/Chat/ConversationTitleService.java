package com.example.demo.Chat;

import com.example.demo.Model.API;
import com.example.demo.Model.Message;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConversationTitleService {

    private static final Logger log =
            LoggerFactory.getLogger(ConversationTitleService.class);

    private final ConversationStore conversationStore;

    public ConversationTitleService(
            ConversationStore conversationStore
    ) {
        this.conversationStore = conversationStore;
    }

    @Async
    public void generateTitle(
            API api,
            Provider provider,
            String modelId,
            String conversationId,
            String userMessage,
            String assistantResponse
    ) {
        try {
            String prompt = """
                    Generate a concise title for this conversation.

                    Rules:
                    - Return only the title.
                    - Maximum 6 words.
                    - Maximum 60 characters.
                    - Do not use quotation marks.
                    - Do not use markdown.
                    - Capture the main topic or intent.
                    - Do not write a generic title like "New Conversation".

                    User message:
                    %s

                    Assistant response:
                    %s
                    """.formatted(
                    limitText(userMessage, 1500),
                    limitText(assistantResponse, 1500)
            );

            List<Message> messages = List.of(
                    new Message("user", prompt)
            );

            // Reuse the exact provider, credential and model
            // that handled the original chat request.
            ProviderResponse response = provider.sendRequest(
                    api,
                    modelId,
                    messages
            );

            if (response == null
                    || response.getContent() == null
                    || response.getContent().isBlank()) {
                throw new IllegalStateException(
                        "Provider returned an empty conversation title"
                );
            }

            String title = normalizeTitle(response.getContent());

            if (title.isBlank()) {
                throw new IllegalStateException(
                        "Generated conversation title is invalid"
                );
            }

            conversationStore.saveGeneratedTitle(
                    conversationId,
                    title
            );

            log.info(
                    "Generated title for conversationId={}",
                    conversationId
            );

        } catch (Exception exception) {

            log.error(
                    "Title generation failed for conversationId={}",
                    conversationId,
                    exception
            );

            conversationStore.markTitleGenerationFailed(
                    conversationId
            );
        }
    }

    private String limitText(String value, int maximumLength) {
        if (value == null) {
            return "";
        }

        String normalized = value.trim();

        if (normalized.length() <= maximumLength) {
            return normalized;
        }

        return normalized.substring(0, maximumLength);
    }

    private String normalizeTitle(String rawTitle) {
        if (rawTitle == null) {
            return "";
        }

        String title = rawTitle
                .trim()
                .replaceAll("\\s+", " ")
                .replaceAll("^[\"'`]+|[\"'`]+$", "")
                .replaceAll("[.!?]+$", "")
                .trim();

        if (title.length() > 60) {
            title = title.substring(0, 60).trim();
        }

        return title;
    }
}