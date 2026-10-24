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

@Component
public class AnthropicProvider implements Provider{

    private static final String BASE_URL = "https://api.anthropic.com/v1";
    private static final long DEFAULT_RESERVED_OUTPUT_TOKENS = 2048;

    private final HttpClient client = HttpClient.newHttpClient();

    @Override
    public List<String> getModels(API api) throws Exception {
        HttpResponse<String> response = client.send(
            requestBuilder(api, BASE_URL + "/models").GET().build(),
            HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessul(response, "Failed to fetch Anthropic models");

        return parseModels(response.body());
    }

    private List<String> parseModels(String responseBody) {
        JsonArray data = JsonParser.parseString(responseBody)
                .getAsJsonObject()
                .getAsJsonArray("data");
        List<String> models = new ArrayList<>();

        for (JsonElement element : data) {
            models.add(element.getAsJsonObject().get("id").getAsString());
        }

        return models;
    }


    @Override
    public ProviderResponse sendRequest() {
        throw new UnsupportedOperationException(
                "Use sendRequest(API, model, messages) for Anthropic"
        );
    }

    @Override
    public ProviderResponse sendRequest(API api, String selectedModel, List<Message> messages) throws Exception {
        JsonObject payload = new JsonObject();
        payload.addProperty("model", selectedModel);
        payload.addProperty("max_tokens", 2048);

        JsonArray chatMessages = new JsonArray();
        StringBuilder systemPrompt = new StringBuilder();

        for (Message message : messages) {
            if ("system".equals(message.getRole())) {
                if (!systemPrompt.isEmpty()) {
                    systemPrompt.append("\n\n");
                }
                systemPrompt.append(message.getContent());
                continue;
            }

            JsonObject chatMessage = new JsonObject();
            chatMessage.addProperty("role", message.getRole());
            chatMessage.addProperty("content", message.getContent());
            chatMessages.add(chatMessage);
        }

        if (!systemPrompt.isEmpty()) {
            payload.addProperty("system", systemPrompt.toString());
        }

        payload.add("messages", chatMessages);

        HttpResponse<String> response = client.send(
                requestBuilder(api, BASE_URL + "/messages")
                        .headers("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                        .build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessul(response, "Anthropic request failed");
        return parseResponse(response.body());


    }

    private ProviderResponse parseResponse(String responseBody) {
        JsonObject response =
                JsonParser.parseString(responseBody).getAsJsonObject();

        StringBuilder content = new StringBuilder();
        JsonArray contentBlocks = response.getAsJsonArray("content");

        if (contentBlocks != null) {
            for (JsonElement element : contentBlocks) {
                JsonObject block = element.getAsJsonObject();

                if ("text".equals(
                        block.has("type")
                                ? block.get("type").getAsString()
                                : "")) {
                    content.append(block.get("text").getAsString());
                }
            }
        }

        JsonObject usage = response.getAsJsonObject("usage");

        if (usage == null) {
            throw new IllegalArgumentException(
                    "Anthropic response did not include usage"
            );
        }

        long inputTokens = usage.get("input_tokens").getAsLong();
        long outputTokens = usage.get("output_tokens").getAsLong();

        long cachedInputTokens = 0;

        if (usage.has("cache_read_input_tokens")
                && !usage.get("cache_read_input_tokens").isJsonNull()) {
            cachedInputTokens =
                    usage.get("cache_read_input_tokens").getAsLong();
        }

        return new ProviderResponse(
                content.isEmpty() ? "No text response generated" : content.toString(),
                new TokenUsage(
                        inputTokens,
                        outputTokens,
                        cachedInputTokens,
                        inputTokens + outputTokens
                )
        );
    }

    @Override
    public Modelnfo getModelInfo(API api, String modelId)
            throws Exception {

        String encodedModelId =
                URLEncoder.encode(modelId, StandardCharsets.UTF_8)
                        .replace("+", "%20");

        HttpResponse<String> response = client.send(
                requestBuilder(
                        api,
                        BASE_URL + "/models/" + encodedModelId
                ).GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessul(response, "Failed to fetch Anthropic model metadata");

        JsonObject model =
                JsonParser.parseString(response.body()).getAsJsonObject();

        if (!model.has("max_input_tokens")
                || model.get("max_input_tokens").isJsonNull()) {
            throw new IllegalArgumentException(
                    "Anthropic model metadata has no max_input_tokens"
            );
        }

        long maxOutputTokens = DEFAULT_RESERVED_OUTPUT_TOKENS;

        if (model.has("max_tokens")
                && !model.get("max_tokens").isJsonNull()) {
            maxOutputTokens = model.get("max_tokens").getAsLong();
        }

        return new Modelnfo(
                "Anthropic",
                modelId,
                model.get("max_input_tokens").getAsLong(),
                maxOutputTokens
        );
    }

    private HttpRequest.Builder requestBuilder(API api, String url)
            throws Exception {

        String apiKey = Encrypt.decrypt(
                api.getAPI(),
                api.getSecretKey()
        );

        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("anthropic-workspace-id", "wrkspc_011dYL5hidMeke6UAAuL3TP2")
                .header("Content-Type", "application/json");
    }

    private void ensureSuccessul(
            HttpResponse<String> response,
            String action
    ) throws Exception {
        if (response.statusCode() < 200
                || response.statusCode() >= 300) {
            throw new Exception(
                    action
                            + " with status " + response.statusCode()
                            + ": " + response.body()
            );
        }
    }

}
