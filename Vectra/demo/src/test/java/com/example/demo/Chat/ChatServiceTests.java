package com.example.demo.Chat;

import com.example.demo.Model.API;
import com.example.demo.Model.Message;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ChatServiceTests {

    @Test
    void sendsTheEntireConversationHistoryToTheProvider() throws Exception {
        RecordingProvider provider = new RecordingProvider();
        List<Message> history = List.of(
                new Message("user", "My name is Alex."),
                new Message("assistant", "Nice to meet you, Alex."),
                new Message("user", "What is my name?")
        );

        new ChatService(provider, null, "What is my name?")
                .sendMessage("gpt-4.1", history);

        assertEquals(history, provider.messages);
        assertEquals("gpt-4.1", provider.modelId);
    }

    private static final class RecordingProvider implements Provider {
        private List<Message> messages;
        private String modelId;

        @Override
        public List<String> getModels(API api) {
            return List.of();
        }

        @Override
        public ProviderResponse sendRequest() {
            return null;
        }

        @Override
        public ProviderResponse sendRequest(API api, String selectedModel, List<Message> messages) {
            this.modelId = selectedModel;
            this.messages = messages;
            return new ProviderResponse("Alex", null);
        }

        @Override
        public Modelnfo getModelInfo(API api, String modelId) {
            return null;
        }
    }
}
