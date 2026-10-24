
package com.example.demo.Service.Providers;

import com.example.demo.Chat.ModelMetadataConfig;
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
import java.util.Locale;

@Component
public class OpenAIProvider implements Provider {

    private static final String MODELS_URL =
            "https://api.openai.com/v1/models";

    private static final String RESPONSES_URL =
            "https://api.openai.com/v1/responses";

    private static final Duration CONNECT_TIMEOUT =
            Duration.ofSeconds(10);

    private static final Duration REQUEST_TIMEOUT =
            Duration.ofSeconds(60);

    private final HttpClient client;
    private final ModelMetadataConfig modelMetadataConfig;

    public OpenAIProvider(ModelMetadataConfig modelMetadataConfig) {
        this.modelMetadataConfig = modelMetadataConfig;

        this.client = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
    }

    @Override
    public Modelnfo getModelInfo(API api, String modelId) {
        if (modelId == null || modelId.isBlank()) {
            throw new IllegalArgumentException("Model ID is required");
        }

        return modelMetadataConfig.getFallbackModelInfo(
                "OpenAI",
                modelId
        );
    }

    @Override
    public List<String> getModels(API api) throws Exception {
        String apiKey = decryptApiKey(api);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(MODELS_URL))
                .timeout(REQUEST_TIMEOUT)
                .header(
                        api.getAuthHeader(),
                        api.getAuthPrefix() + apiKey
                )
                .GET()
                .build();

        HttpResponse<String> response = execute(request);

        if (!isSuccessful(response.statusCode())) {
            throw new Exception(
                    "OpenAI model discovery failed: "
                            + extractErrorMessage(
                            response.body(),
                            response.statusCode()
                    )
            );
        }

        return parseModels(response.body());
    }

    private List<String> parseModels(String responseBody)
            throws Exception {

        JsonObject json = parseJsonObject(responseBody);

        JsonArray data = json.has("data")
                && json.get("data").isJsonArray()
                ? json.getAsJsonArray("data")
                : new JsonArray();

        List<String> models = new ArrayList<>();

        for (JsonElement element : data) {
            if (!element.isJsonObject()) {
                continue;
            }

            JsonObject model = element.getAsJsonObject();

            if (!model.has("id")
                    || !model.get("id").isJsonPrimitive()) {
                continue;
            }

            String id = model.get("id").getAsString();

            if (isChatModel(id)) {
                models.add(id);
            }
        }

        models.sort(String.CASE_INSENSITIVE_ORDER);
        return models;
    }

    private boolean isChatModel(String modelId) {
        if (modelId == null || modelId.isBlank()) {
            return false;
        }

        String id = modelId.toLowerCase(Locale.ROOT);

        if (!id.startsWith("gpt-")) {
            return false;
        }

        String[] excludedPatterns = {
                "embedding",
                "moderation",
                "whisper",
                "transcribe",
                "tts",
                "audio",
                "realtime",
                "image",
                "dall-e",
                "search-preview",
                "deep-research",
                "computer-use"
        };

        for (String pattern : excludedPatterns) {
            if (id.contains(pattern)) {
                return false;
            }
        }

        return true;
    }

    @Override
    public ProviderResponse sendRequest() {
        throw new UnsupportedOperationException(
                "OpenAI requests require a credential, model and messages"
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
                    "OpenAI credential is required"
            );
        }

        if (selectedModel == null || selectedModel.isBlank()) {
            throw new IllegalArgumentException("Model ID is required");
        }

        if (messages == null || messages.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one message is required"
            );
        }

        String apiKey = decryptApiKey(api);
        Modelnfo modelInfo = getModelInfo(api, selectedModel);

        JsonObject json = new JsonObject();
        json.addProperty("model", selectedModel);
        json.addProperty(
                "max_output_tokens",
                modelInfo.getMaxOutputTokens()
        );

        JsonArray input = new JsonArray();

        for (Message message : messages) {
            if (message == null) {
                continue;
            }

            JsonObject item = new JsonObject();
            item.addProperty("role", message.getRole());
            item.addProperty("content", message.getContent());

            input.add(item);
        }

        if (input.isEmpty()) {
            throw new IllegalArgumentException(
                    "No valid messages were provided"
            );
        }

        json.add("input", input);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(RESPONSES_URL))
                .timeout(REQUEST_TIMEOUT)
                .header(
                        api.getAuthHeader(),
                        api.getAuthPrefix() + apiKey
                )
                .header("Content-Type", "application/json")
                .POST(
                        HttpRequest.BodyPublishers.ofString(
                                json.toString()
                        )
                )
                .build();

        HttpResponse<String> response = execute(request);

        if (!isSuccessful(response.statusCode())) {
            throw new Exception(
                    "OpenAI request failed: "
                            + extractErrorMessage(
                            response.body(),
                            response.statusCode()
                    )
            );
        }

        return parseResponse(response.body());
    }

    private HttpResponse<String> execute(HttpRequest request)
            throws Exception {

        try {
            return client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new Exception(
                    "OpenAI request was interrupted",
                    exception
            );
        }
    }

    private String decryptApiKey(API api) throws Exception {
        if (api == null) {
            throw new IllegalArgumentException(
                    "API credential is required"
            );
        }

        String encryptedApiKey = api.getAPI();

        if (encryptedApiKey == null || encryptedApiKey.isBlank()) {
            throw new IllegalArgumentException(
                    "OpenAI API key is missing"
            );
        }

        String apiKey = Encrypt.decrypt(
                encryptedApiKey,
                api.getSecretKey()
        );

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "API key could not be decrypted"
            );
        }

        return apiKey;
    }

    private ProviderResponse parseResponse(String responseBody)
            throws Exception {

        JsonObject json = parseJsonObject(responseBody);
        String answer = "";

        if (json.has("output_text")
                && !json.get("output_text").isJsonNull()) {
            answer = json.get("output_text").getAsString();
        }

        if (answer.isBlank()
                && json.has("output")
                && json.get("output").isJsonArray()) {

            JsonArray output = json.getAsJsonArray("output");

            for (JsonElement outputElement : output) {
                if (!outputElement.isJsonObject()) {
                    continue;
                }

                JsonObject outputItem = outputElement.getAsJsonObject();

                if (!outputItem.has("content")
                        || !outputItem.get("content").isJsonArray()) {
                    continue;
                }

                JsonArray content =
                        outputItem.getAsJsonArray("content");

                for (JsonElement contentElement : content) {
                    if (!contentElement.isJsonObject()) {
                        continue;
                    }

                    JsonObject contentItem =
                            contentElement.getAsJsonObject();

                    if (contentItem.has("text")
                            && !contentItem.get("text").isJsonNull()) {
                        answer += contentItem.get("text").getAsString();
                    }
                }
            }
        }

        JsonObject usage = json.has("usage")
                && json.get("usage").isJsonObject()
                ? json.getAsJsonObject("usage")
                : new JsonObject();

        long inputTokens = getLong(usage, "input_tokens");
        long outputTokens = getLong(usage, "output_tokens");
        long totalTokens = getLong(usage, "total_tokens");

        long cachedInputTokens = 0;

        if (usage.has("input_tokens_details")
                && usage.get("input_tokens_details").isJsonObject()) {

            JsonObject inputDetails =
                    usage.getAsJsonObject("input_tokens_details");

            cachedInputTokens = getLong(
                    inputDetails,
                    "cached_tokens"
            );
        }

        TokenUsage tokenUsage = new TokenUsage(
                inputTokens,
                outputTokens,
                cachedInputTokens,
                totalTokens
        );

        if (answer.isBlank()) {
            answer = "The model returned no text content.";
        }

        return new ProviderResponse(answer, tokenUsage);
    }

    private JsonObject parseJsonObject(String responseBody)
            throws Exception {

        if (responseBody == null || responseBody.isBlank()) {
            throw new Exception(
                    "OpenAI returned an empty response body"
            );
        }

        try {
            JsonElement element = JsonParser.parseString(responseBody);

            if (!element.isJsonObject()) {
                throw new Exception(
                        "OpenAI returned an unexpected JSON structure"
                );
            }

            return element.getAsJsonObject();

        } catch (com.google.gson.JsonParseException exception) {
            throw new Exception(
                    "OpenAI returned invalid JSON",
                    exception
            );
        }
    }

    private long getLong(JsonObject json, String property) {
        if (!json.has(property) || json.get(property).isJsonNull()) {
            return 0;
        }

        try {
            return json.get(property).getAsLong();
        } catch (RuntimeException exception) {
            return 0;
        }
    }

    private boolean isSuccessful(int statusCode) {
        return statusCode >= 200 && statusCode < 300;
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
