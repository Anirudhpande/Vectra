
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
public class GeminiProvider implements Provider {

    private static final String BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta";

    private static final long DEFAULT_OUTPUT_TOKENS = 2048;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public List<String> getModels(API api) throws Exception {

        HttpResponse<String> response = client.send(
                requestBuilder(api, BASE_URL + "/models")
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(response, "Failed to fetch Gemini models");

        JsonObject body = parseObject(
                response.body(),
                "Gemini model list"
        );

        JsonArray modelsArray = body.has("models")
                && body.get("models").isJsonArray()
                ? body.getAsJsonArray("models")
                : new JsonArray();

        List<String> models = new ArrayList<>();

        for (JsonElement element : modelsArray) {
            if (!element.isJsonObject()) {
                continue;
            }

            JsonObject model = element.getAsJsonObject();

            if (!model.has("name")
                    || !model.get("name").isJsonPrimitive()
                    || !model.has("supportedGenerationMethods")
                    || !model.get("supportedGenerationMethods").isJsonArray()) {
                continue;
            }

            boolean supportsGenerateContent = false;

            for (JsonElement method :
                    model.getAsJsonArray("supportedGenerationMethods")) {

                if (method.isJsonPrimitive()
                        && "generateContent".equals(method.getAsString())) {
                    supportsGenerateContent = true;
                    break;
                }
            }

            if (supportsGenerateContent) {
                String name = model.get("name").getAsString();

                models.add(name.startsWith("models/")
                        ? name.substring("models/".length())
                        : name);
            }
        }

        return models;
    }

    @Override
    public ProviderResponse sendRequest() {
        throw new UnsupportedOperationException(
                "Use sendRequest(API, model, messages) for Gemini"
        );
    }

    @Override
    public ProviderResponse sendRequest(
            API api,
            String selectedModel,
            List<Message> messages
    ) throws Exception {

        if (selectedModel == null || selectedModel.isBlank()) {
            throw new IllegalArgumentException(
                    "Gemini model ID is required"
            );
        }

        if (messages == null || messages.isEmpty()) {
            throw new IllegalArgumentException(
                    "Messages are required"
            );
        }

        JsonObject payload = new JsonObject();
        JsonArray contents = new JsonArray();
        JsonArray systemParts = new JsonArray();

        for (Message message : messages) {
            if (message == null) {
                throw new IllegalArgumentException(
                        "Messages cannot contain null entries"
                );
            }

            String role = message.getRole();
            String content = message.getContent();

            if (role == null || content == null) {
                throw new IllegalArgumentException(
                        "Message role and content cannot be null"
                );
            }

            if ("system".equals(role)) {
                JsonObject part = new JsonObject();
                part.addProperty("text", content);
                systemParts.add(part);
                continue;
            }

            JsonObject contentObject = new JsonObject();
            JsonArray parts = new JsonArray();
            JsonObject part = new JsonObject();

            part.addProperty("text", content);
            parts.add(part);

            if ("assistant".equals(role)) {
                contentObject.addProperty("role", "model");
            } else if ("user".equals(role)) {
                contentObject.addProperty("role", "user");
            } else {
                throw new IllegalArgumentException(
                        "Unsupported Gemini message role: " + role
                );
            }

            contentObject.add("parts", parts);
            contents.add(contentObject);
        }

        if (!systemParts.isEmpty()) {
            JsonObject systemInstruction = new JsonObject();
            systemInstruction.add("parts", systemParts);
            payload.add("systemInstruction", systemInstruction);
        }

        if (contents.isEmpty()) {
            throw new IllegalArgumentException(
                    "Gemini requires at least one user or assistant message"
            );
        }

        payload.add("contents", contents);

        // Use the selected model's real output limit when available.
        // Fall back to a conservative default if metadata retrieval fails.
        long maxOutputTokens = DEFAULT_OUTPUT_TOKENS;

        try {
            Modelnfo modelInfo = getModelInfo(api, selectedModel);

            if (modelInfo != null
                    && modelInfo.getMaxOutputTokens() > 0) {
                maxOutputTokens = Math.min(
                        modelInfo.getMaxOutputTokens(),
                        Integer.MAX_VALUE
                );
            }
        } catch (Exception ignored) {
            // A metadata lookup failure should not automatically prevent
            // an otherwise valid generation request.
        }

        JsonObject generationConfig = new JsonObject();
        generationConfig.addProperty(
                "maxOutputTokens",
                maxOutputTokens
        );
        payload.add("generationConfig", generationConfig);

        String model = normalizeModelId(selectedModel);

        String url = BASE_URL
                + "/models/"
                + model
                + ":generateContent";

        HttpRequest request = requestBuilder(api, url)
                .POST(HttpRequest.BodyPublishers.ofString(
                        payload.toString()
                ))
                .build();

        HttpResponse<String> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(response, "Gemini request failed");

        return parseResponse(response.body());
    }

    private ProviderResponse parseResponse(String responseBody)
            throws Exception {

        JsonObject response = parseObject(
                responseBody,
                "Gemini generation response"
        );

        StringBuilder content = new StringBuilder();

        JsonArray candidates = response.has("candidates")
                && response.get("candidates").isJsonArray()
                ? response.getAsJsonArray("candidates")
                : new JsonArray();

        if (!candidates.isEmpty()
                && candidates.get(0).isJsonObject()) {

            JsonObject candidate = candidates.get(0).getAsJsonObject();

            if (candidate.has("content")
                    && candidate.get("content").isJsonObject()) {

                JsonObject candidateContent =
                        candidate.getAsJsonObject("content");

                if (candidateContent.has("parts")
                        && candidateContent.get("parts").isJsonArray()) {

                    for (JsonElement element :
                            candidateContent.getAsJsonArray("parts")) {

                        if (!element.isJsonObject()) {
                            continue;
                        }

                        JsonObject part = element.getAsJsonObject();

                        if (part.has("text")
                                && !part.get("text").isJsonNull()) {
                            content.append(
                                    part.get("text").getAsString()
                            );
                        }
                    }
                }
            }
        }

        JsonObject usage = response.has("usageMetadata")
                && response.get("usageMetadata").isJsonObject()
                ? response.getAsJsonObject("usageMetadata")
                : null;

        long inputTokens = 0;
        long outputTokens = 0;
        long cachedInputTokens = 0;
        long totalTokens = 0;

        if (usage != null) {
            inputTokens = readLong(usage, "promptTokenCount", 0);
            outputTokens = readLong(usage, "candidatesTokenCount", 0);
            cachedInputTokens = readLong(
                    usage,
                    "cachedContentTokenCount",
                    0
            );
            totalTokens = readLong(
                    usage,
                    "totalTokenCount",
                    inputTokens + outputTokens
            );
        }

        if (content.isEmpty()) {
            String reason = "Gemini returned no text content";

            if (!candidates.isEmpty()
                    && candidates.get(0).isJsonObject()) {

                JsonObject candidate =
                        candidates.get(0).getAsJsonObject();

                if (candidate.has("finishReason")) {
                    reason += ". Finish reason: "
                            + candidate.get("finishReason").getAsString();
                }
            }

            if (response.has("promptFeedback")
                    && response.get("promptFeedback").isJsonObject()) {

                JsonObject feedback =
                        response.getAsJsonObject("promptFeedback");

                if (feedback.has("blockReason")) {
                    reason += ". Prompt block reason: "
                            + feedback.get("blockReason").getAsString();
                }
            }

            throw new IllegalStateException(reason);
        }

        return new ProviderResponse(
                content.toString(),
                new TokenUsage(
                        inputTokens,
                        outputTokens,
                        cachedInputTokens,
                        totalTokens
                )
        );
    }

    @Override
    public Modelnfo getModelInfo(
            API api,
            String modelId
    ) throws Exception {

        if (modelId == null || modelId.isBlank()) {
            throw new IllegalArgumentException(
                    "Gemini model ID is required"
            );
        }

        String url = BASE_URL
                + "/models/"
                + normalizeModelId(modelId);

        HttpResponse<String> response = client.send(
                requestBuilder(api, url)
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(
                response,
                "Failed to fetch Gemini model metadata"
        );

        JsonObject modelInfo = parseObject(
                response.body(),
                "Gemini model metadata"
        );

        long inputLimit = readLong(
                modelInfo,
                "inputTokenLimit",
                0
        );

        long outputLimit = readLong(
                modelInfo,
                "outputTokenLimit",
                0
        );

        if (inputLimit <= 0 || outputLimit <= 0) {
            throw new IllegalArgumentException(
                    "Gemini model metadata has missing or invalid token limits"
            );
        }

        return new Modelnfo(
                "Gemini",
                normalizeModelId(modelId),
                inputLimit,
                outputLimit
        );
    }

    private HttpRequest.Builder requestBuilder(
            API api,
            String url
    ) throws Exception {

        if (api == null) {
            throw new IllegalArgumentException(
                    "Gemini API credentials are required"
            );
        }

        String apiKey = Encrypt.decrypt(
                api.getAPI(),
                api.getSecretKey()
        );

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException(
                    "Gemini API key is empty"
            );
        }

        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(60))
                .header("x-goog-api-key", apiKey)
                .header("Content-Type", "application/json");
    }

    private String normalizeModelId(String modelId) {
        String model = modelId.trim();

        if (model.startsWith("models/")) {
            model = model.substring("models/".length());
        }

        if (model.isBlank()
                || model.contains("/")
                || model.contains("?")
                || model.contains("#")) {
            throw new IllegalArgumentException(
                    "Invalid Gemini model ID: " + modelId
            );
        }

        return model;
    }

    private JsonObject parseObject(
            String json,
            String description
    ) throws Exception {

        try {
            JsonElement element = JsonParser.parseString(json);

            if (!element.isJsonObject()) {
                throw new IllegalArgumentException(
                        description + " is not a JSON object"
                );
            }

            return element.getAsJsonObject();

        } catch (RuntimeException exception) {
            throw new Exception(
                    "Could not parse " + description,
                    exception
            );
        }
    }

    private long readLong(
            JsonObject object,
            String key,
            long defaultValue
    ) {

        if (object == null
                || !object.has(key)
                || object.get(key).isJsonNull()) {
            return defaultValue;
        }

        try {
            return object.get(key).getAsLong();
        } catch (RuntimeException exception) {
            return defaultValue;
        }
    }

    private void ensureSuccessful(
            HttpResponse<String> response,
            String action
    ) throws Exception {

        int status = response.statusCode();

        if (status < 200 || status >= 300) {
            String details = response.body();

            try {
                JsonObject body = JsonParser.parseString(
                        response.body()
                ).getAsJsonObject();

                if (body.has("error")
                        && body.get("error").isJsonObject()) {

                    JsonObject error = body.getAsJsonObject("error");

                    if (error.has("message")) {
                        details = error.get("message").getAsString();
                    }
                }
            } catch (RuntimeException ignored) {
                // Keep the original response if it isn't structured JSON.
            }

            throw new Exception(
                    action + " with HTTP " + status + ": " + details
            );
        }
    }
}
