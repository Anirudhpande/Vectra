package com.example.demo.Chat;

import com.example.demo.Model.API;
import com.example.demo.Model.Message;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderResponse;

import java.util.ArrayList;
import java.util.List;

/** A request-scoped summarizer that reuses the selected chat provider and model. */
public class ProviderSummarizer implements Summarizer {

    private final Provider provider;
    private final API api;
    private final String model;

    public ProviderSummarizer(Provider provider, API api, String model) {
        this.provider = provider;
        this.api = api;
        this.model = model;
    }

    @Override
    public String summarize(String existingSummary, List<Message> messages) throws Exception {
        StringBuilder content = new StringBuilder();
        content.append("Summarize the following conversation history. ")
                .append("Preserve important facts, decisions, technical details, user preferences, ")
                .append("and unresolved tasks. Be concise and do not invent information.\n\n");

        if (existingSummary != null && !existingSummary.isBlank()) {
            content.append("Existing summary:\n")
                    .append(existingSummary)
                    .append("\n\n");
        }

        content.append("Conversation history:\n");
        for (Message message : messages) {
            content.append(message.getRole())
                    .append(": ")
                    .append(message.getContent())
                    .append('\n');
        }

        ProviderResponse response = provider.sendRequest(
                api,
                model,
                List.of(new Message("user", content.toString()))
        );

        if (response == null || response.getContent() == null || response.getContent().isBlank()) {
            throw new IllegalStateException("Summarization returned no content");
        }

        return response.getContent();
    }
}
