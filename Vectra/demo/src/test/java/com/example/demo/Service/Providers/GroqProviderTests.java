package com.example.demo.Service.Providers;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class GroqProviderTests {

    private final GroqProvider provider = new GroqProvider();

    @Test
    void isRegisteredWithBearerCredentialConfiguration() {
        ProviderConfig config = ProviderRegistry.getConfig("groq");

        assertInstanceOf(GroqProvider.class, ProviderRegistry.getProvider("groq"));
        assertEquals("Groq", config.getProviderName());
        assertEquals("Authorization", config.getAuthHeader());
        assertEquals("Bearer ", config.getAuthPrefix());
    }

    @Test
    void parsesModelListAndChatCompletionUsage() {
        assertEquals(
                List.of("llama-3.3-70b-versatile", "openai/gpt-oss-20b"),
                provider.parseModels("""
                        {"data":[
                          {"id":"llama-3.3-70b-versatile"},
                          {"id":"openai/gpt-oss-20b"}
                        ]}
                        """)
        );

        ProviderResponse response = provider.parseResponse("""
                {
                  "choices":[{"message":{"content":"Hello from Groq"}}],
                  "usage":{
                    "prompt_tokens":12,
                    "completion_tokens":4,
                    "total_tokens":16,
                    "prompt_tokens_details":{"cached_tokens":3}
                  }
                }
                """);

        assertEquals("Hello from Groq", response.getContent());
        assertEquals(12, response.getUsage().getInputTokens());
        assertEquals(4, response.getUsage().getOutputTokens());
        assertEquals(3, response.getUsage().getCachedInputTokens());
        assertEquals(16, response.getUsage().getTotalTokens());
    }
}
