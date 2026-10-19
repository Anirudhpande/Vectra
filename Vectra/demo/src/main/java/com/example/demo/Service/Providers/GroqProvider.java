package com.example.demo.Service.Providers;

import com.example.demo.Chat.Modelnfo;
import com.example.demo.Model.API;
import com.example.demo.Model.Message;
import com.example.demo.Model.TokenUsage;
import com.example.demo.Security.SecurityLogic.Encrypt;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** Groq's OpenAI-compatible Chat Completions integration. */
@Component
public class GroqProvider implements Provider {

    private static final String BASE_URL = "https://api.groq.com/openai/v1";
    private static final long DEFAULT_RESERVED_OUTPUT_TOKENS = 2048;

    private final HttpClient client = HttpClient.newHttpClient();

    @Override
    public List<String> getModels(API api) throws Exception {
        HttpResponse<String> response = client.send(
                requestBuilder(api, BASE_URL + "/models").GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(response, "Failed to fetch Groq models");
        return parseModels(response.body());
    }

    @Override
    public Modelnfo getModelInfo(API api, String modelId) throws Exception {
        String encodedModelId = URLEncoder.encode(modelId, StandardCharsets.UTF_8);
        HttpResponse<String> response = client.send(
                requestBuilder(api, BASE_URL + "/models/" + encodedModelId).GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(response, "Failed to fetch Groq model metadata");

        JsonObject model = JsonParser.parseString(response.body()).getAsJsonObject();
        if (!model.has("context_window") || model.get("context_window").isJsonNull()) {
            throw new IllegalArgumentException("Groq model metadata has no context window");
        }

        long maxOutputTokens = DEFAULT_RESERVED_OUTPUT_TOKENS;
        if (model.has("max_completion_tokens") && !model.get("max_completion_tokens").isJsonNull()) {
            maxOutputTokens = model.get("max_completion_tokens").getAsLong();
        }

        return new Modelnfo(
                "Groq",
                modelId,
                model.get("context_window").getAsLong(),
                maxOutputTokens
        );
    }

    @Override
    public ProviderResponse sendRequest() {
        return null;
    }

    @Override
    public ProviderResponse sendRequest(
            API api,
            String selectedModel,
            List<Message> messages
    ) throws Exception {
        JsonObject payload = new JsonObject();
        payload.addProperty("model", selectedModel);

        JsonArray chatMessages = new JsonArray();
        for (Message message : messages) {
            JsonObject chatMessage = new JsonObject();
            chatMessage.addProperty("role", message.getRole());
            chatMessage.addProperty("content", message.getContent());
            chatMessages.add(chatMessage);
        }
        payload.add("messages", chatMessages);

        HttpResponse<String> response = client.send(
                requestBuilder(api, BASE_URL + "/chat/completions")
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                        .build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(response, "Groq request failed");
        return parseResponse(response.body());
    }

    List<String> parseModels(String responseBody) {
        JsonArray data = JsonParser.parseString(responseBody)
                .getAsJsonObject()
                .getAsJsonArray("data");
        List<String> models = new ArrayList<>();

        for (JsonElement element : data) {
            models.add(element.getAsJsonObject().get("id").getAsString());
        }

        return models;
    }

    ProviderResponse parseResponse(String responseBody) {
        JsonObject response = JsonParser.parseString(responseBody).getAsJsonObject();
        String content = "No response generated";

        JsonArray choices = response.getAsJsonArray("choices");
        if (choices != null && !choices.isEmpty()) {
            JsonObject message = choices.get(0).getAsJsonObject().getAsJsonObject("message");
            if (message != null && message.has("content") && !message.get("content").isJsonNull()) {
                content = message.get("content").getAsString();
            }
        }

        JsonObject usage = response.getAsJsonObject("usage");
        if (usage == null) {
            throw new IllegalArgumentException("Groq response did not include usage");
        }

        long cachedInputTokens = 0;
        if (usage.has("prompt_tokens_details") && !usage.get("prompt_tokens_details").isJsonNull()) {
            JsonObject details = usage.getAsJsonObject("prompt_tokens_details");
            if (details.has("cached_tokens") && !details.get("cached_tokens").isJsonNull()) {
                cachedInputTokens = details.get("cached_tokens").getAsLong();
            }
        }

        return new ProviderResponse(
                content,
                new TokenUsage(
                        usage.get("prompt_tokens").getAsLong(),
                        usage.get("completion_tokens").getAsLong(),
                        cachedInputTokens,
                        usage.get("total_tokens").getAsLong()
                )
        );
    }

    private HttpRequest.Builder requestBuilder(API api, String url) throws Exception {
        String apiKey = Encrypt.decrypt(api.getAPI(), api.getSecretKey());
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header(api.getAuthHeader(), api.getAuthPrefix() + apiKey);
    }

    private void ensureSuccessful(HttpResponse<String> response, String action) throws Exception {
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new Exception(action + " with status " + response.statusCode());
        }
    }
}
