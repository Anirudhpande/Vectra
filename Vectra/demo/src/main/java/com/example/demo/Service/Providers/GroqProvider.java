
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
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
public class GroqProvider implements Provider {

    private static final String BASE_URL =
            "https://api.groq.com/openai/v1";

    private static final Duration CONNECT_TIMEOUT =
            Duration.ofSeconds(10);

    private static final Duration REQUEST_TIMEOUT =
            Duration.ofSeconds(60);

    private static final long DEFAULT_RESERVED_OUTPUT_TOKENS = 2048;

    private final HttpClient client;

    public GroqProvider() {
        this.client = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
    }

    @Override
    public List<String> getModels(API api) throws Exception {
        JsonObject response = fetchModelsResponse(api);
        JsonArray data = getModelData(response);

        List<String> models = new ArrayList<>();

        for (JsonElement element : data) {
            if (!element.isJsonObject()) {
                continue;
            }

            JsonObject model = element.getAsJsonObject();

            if (model.has("id")
                    && !model.get("id").isJsonNull()) {

                String id = model.get("id").getAsString();

                if (!id.isBlank()) {
                    models.add(id);
                }
            }
        }

        models.sort(String.CASE_INSENSITIVE_ORDER);
        return models;
    }

    @Override
    public Modelnfo getModelInfo(
            API api,
            String modelId
    ) throws Exception {

        if (modelId == null || modelId.isBlank()) {
            throw new IllegalArgumentException(
                    "Groq model ID is required"
            );
        }

        // Look up the model in the model list.
        // This avoids URL path issues with IDs containing '/'.
        JsonObject response = fetchModelsResponse(api);
        JsonArray data = getModelData(response);

        for (JsonElement element : data) {
            if (!element.isJsonObject()) {
                continue;
            }

            JsonObject model = element.getAsJsonObject();

            if (!model.has("id")
                    || model.get("id").isJsonNull()) {
                continue;
            }

            String id = model.get("id").getAsString();

            if (!id.equals(modelId)) {
                continue;
            }

            long contextWindow = getLong(model, "context_window");

            if (contextWindow <= 0) {
                throw new Exception(
                        "Groq did not provide a valid context window "
                                + "for model: " + modelId
                );
            }

            long maxOutputTokens = getLong(
                    model,
                    "max_completion_tokens"
            );

            if (maxOutputTokens <= 0) {
                maxOutputTokens = DEFAULT_RESERVED_OUTPUT_TOKENS;
            }

            // Output must be smaller than the context window.
            maxOutputTokens = Math.min(
                    maxOutputTokens,
                    contextWindow - 1
            );

            return new Modelnfo(
                    "Groq",
                    modelId,
                    contextWindow,
                    maxOutputTokens
            );
        }

        throw new Exception(
                "Model '" + modelId
                        + "' was not found in the Groq model list "
                        + "available to this API key"
        );
    }

    @Override
    public ProviderResponse sendRequest() {
        throw new UnsupportedOperationException(
                "Groq requests require a credential, model and messages"
        );
    }

    @Override
    public ProviderResponse sendRequest(
            API api,
            String selectedModel,
            List<Message> messages
    ) throws Exception {

        if (api == null) {
            throw new IllegalArgumentException(
                    "Groq API credential is required"
            );
        }

        if (selectedModel == null || selectedModel.isBlank()) {
            throw new IllegalArgumentException(
                    "Groq model ID is required"
            );
        }

        if (messages == null || messages.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one message is required"
            );
        }

        Modelnfo modelInfo = getModelInfo(api, selectedModel);

        JsonObject payload = new JsonObject();
        payload.addProperty("model", selectedModel);

        payload.addProperty(
                "max_completion_tokens",
                modelInfo.getMaxOutputTokens()
        );

        JsonArray chatMessages = new JsonArray();

        for (Message message : messages) {
            if (message == null) {
                continue;
            }

            JsonObject chatMessage = new JsonObject();
            chatMessage.addProperty("role", message.getRole());
            chatMessage.addProperty("content", message.getContent());

            chatMessages.add(chatMessage);
        }

        if (chatMessages.isEmpty()) {
            throw new IllegalArgumentException(
                    "No valid messages were provided"
            );
        }

        payload.add("messages", chatMessages);

        HttpRequest request = requestBuilder(
                api,
                BASE_URL + "/chat/completions"
        )
                .header("Content-Type", "application/json")
                .POST(
                        HttpRequest.BodyPublishers.ofString(
                                payload.toString()
                        )
                )
                .build();

        HttpResponse<String> response = execute(request);

        ensureSuccessful(response, "Groq request failed");

        return parseResponse(response.body());
    }

    private JsonObject fetchModelsResponse(API api)
            throws Exception {

        HttpRequest request = requestBuilder(
                api,
                BASE_URL + "/models"
        )
                .GET()
                .build();

        HttpResponse<String> response = execute(request);

        ensureSuccessful(response, "Failed to fetch Groq models");

        return parseJsonObject(response.body());
    }

    private JsonArray getModelData(JsonObject response)
            throws Exception {

        if (!response.has("data")
                || !response.get("data").isJsonArray()) {
            throw new Exception(
                    "Groq returned an invalid model list"
            );
        }

        return response.getAsJsonArray("data");
    }

    ProviderResponse parseResponse(String responseBody)
            throws Exception {

        JsonObject response = parseJsonObject(responseBody);

        String content = "";

        if (response.has("choices")
                && response.get("choices").isJsonArray()) {

            JsonArray choices = response.getAsJsonArray("choices");

            if (!choices.isEmpty()
                    && choices.get(0).isJsonObject()) {

                JsonObject choice = choices.get(0).getAsJsonObject();

                if (choice.has("message")
                        && choice.get("message").isJsonObject()) {

                    JsonObject message =
                            choice.getAsJsonObject("message");

                    if (message.has("content")
                            && !message.get("content").isJsonNull()
                            && message.get("content").isJsonPrimitive()) {

                        content = message.get("content").getAsString();
                    }
                }
            }
        }

        JsonObject usage = response.has("usage")
                && response.get("usage").isJsonObject()
                ? response.getAsJsonObject("usage")
                : new JsonObject();

        long promptTokens = getLong(usage, "prompt_tokens");
        long completionTokens = getLong(usage, "completion_tokens");
        long totalTokens = getLong(usage, "total_tokens");

        long cachedInputTokens = 0;

        if (usage.has("prompt_tokens_details")
                && usage.get("prompt_tokens_details").isJsonObject()) {

            JsonObject details =
                    usage.getAsJsonObject("prompt_tokens_details");

            cachedInputTokens = getLong(details, "cached_tokens");
        }

        TokenUsage tokenUsage = new TokenUsage(
                promptTokens,
                completionTokens,
                cachedInputTokens,
                totalTokens
        );

        if (content.isBlank()) {
            content = "The model returned no text content.";
        }

        return new ProviderResponse(content, tokenUsage);
    }

    private HttpRequest.Builder requestBuilder(
            API api,
            String url
    ) throws Exception {

        if (api == null) {
            throw new IllegalArgumentException(
                    "Groq API credential is required"
            );
        }

        String encryptedApiKey = api.getAPI();

        if (encryptedApiKey == null || encryptedApiKey.isBlank()) {
            throw new IllegalArgumentException(
                    "Groq API key is missing"
            );
        }

        String apiKey = Encrypt.decrypt(
                encryptedApiKey,
                api.getSecretKey()
        );

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Groq API key could not be decrypted"
            );
        }

        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(REQUEST_TIMEOUT)
                .header(
                        api.getAuthHeader(),
                        api.getAuthPrefix() + apiKey
                );
    }

    private HttpResponse<String> execute(
            HttpRequest request
    ) throws Exception {

        try {
            return client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new Exception(
                    "Groq request was interrupted",
                    exception
            );
        }
    }

    private void ensureSuccessful(
            HttpResponse<String> response,
            String action
    ) throws Exception {

        int statusCode = response.statusCode();

        if (statusCode < 200 || statusCode >= 300) {
            throw new Exception(
                    action + ": "
                            + extractErrorMessage(
                            response.body(),
                            statusCode
                    )
            );
        }
    }

    private JsonObject parseJsonObject(String responseBody)
            throws Exception {

        if (responseBody == null || responseBody.isBlank()) {
            throw new Exception(
                    "Groq returned an empty response body"
            );
        }

        try {
            JsonElement element = JsonParser.parseString(responseBody);

            if (!element.isJsonObject()) {
                throw new Exception(
                        "Groq returned an unexpected JSON structure"
                );
            }

            return element.getAsJsonObject();

        } catch (com.google.gson.JsonParseException exception) {
            throw new Exception(
                    "Groq returned invalid JSON",
                    exception
            );
        }
    }

    private long getLong(
            JsonObject json,
            String property
    ) {

        if (!json.has(property)
                || json.get(property).isJsonNull()) {
            return 0;
        }

        try {
            return json.get(property).getAsLong();

        } catch (RuntimeException exception) {
            return 0;
        }
    }

    private String extractErrorMessage(
            String responseBody,
            int statusCode
    ) {

        if (responseBody != null && !responseBody.isBlank()) {
            try {
                JsonObject json = JsonParser.parseString(responseBody)
                        .getAsJsonObject();

                if (json.has("error")
                        && json.get("error").isJsonObject()) {

                    JsonObject error = json.getAsJsonObject("error");

                    if (error.has("message")
                            && !error.get("message").isJsonNull()) {

                        return "HTTP " + statusCode + ": "
                                + error.get("message").getAsString();
                    }
                }

            } catch (RuntimeException ignored) {
                // Avoid returning arbitrary response bodies.
            }
        }

        return "HTTP " + statusCode;
    }
}
