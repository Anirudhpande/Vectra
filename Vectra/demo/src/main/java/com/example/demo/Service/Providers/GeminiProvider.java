
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
public class GeminiProvider implements Provider {

    private static final String BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta";

    private static final long DEFAULT_RESERVED_OUTPUT_TOKENS = 2048;

    private final HttpClient client = HttpClient.newHttpClient();

    @Override
    public List<String> getModels(API api) throws Exception {

        HttpResponse<String> response = client.send(
                requestBuilder(api, BASE_URL + "/models")
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(response, "Failed to fetch Gemini models");

        JsonObject body =
                JsonParser.parseString(response.body()).getAsJsonObject();

        JsonArray data = body.getAsJsonArray("models");

        List<String> models = new ArrayList<>();

        if (data == null) {
            return models;
        }

        for (JsonElement element : data) {
            JsonObject model = element.getAsJsonObject();

            if (!model.has("name")
                    || !model.has("supportedGenerationMethods")) {
                continue;
            }

            JsonArray methods =
                    model.getAsJsonArray("supportedGenerationMethods");

            boolean supportsGenerateContent = false;

            for (JsonElement method : methods) {
                if ("generateContent".equals(method.getAsString())) {
                    supportsGenerateContent = true;
                    break;
                }
            }

            if (supportsGenerateContent) {
                String name = model.get("name").getAsString();

                // Gemini returns names like "models/gemini-...".
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

        JsonObject payload = new JsonObject();
        JsonArray contents = new JsonArray();

        JsonObject systemInstruction = new JsonObject();
        JsonArray systemParts = new JsonArray();

        for (Message message : messages) {
            String role = message.getRole();
            String content = message.getContent();

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

            // Gemini uses "model" instead of "assistant".
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
            systemInstruction.add("parts", systemParts);
            payload.add("systemInstruction", systemInstruction);
        }

        if (contents.isEmpty()) {
            throw new IllegalArgumentException(
                    "Gemini requires at least one user or assistant message"
            );
        }

        payload.add("contents", contents);

        JsonObject generationConfig = new JsonObject();
        generationConfig.addProperty(
                "maxOutputTokens",
                DEFAULT_RESERVED_OUTPUT_TOKENS
        );
        payload.add("generationConfig", generationConfig);

        String model = selectedModel.startsWith("models/")
                ? selectedModel.substring("models/".length())
                : selectedModel;

        String encodedModel = URLEncoder.encode(
                model,
                StandardCharsets.UTF_8
        ).replace("+", "%20");

        HttpResponse<String> response = client.send(
                requestBuilder(
                        api,
                        BASE_URL + "/models/" + encodedModel
                                + ":generateContent"
                )
                        .POST(HttpRequest.BodyPublishers.ofString(
                                payload.toString()
                        ))
                        .build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(response, "Gemini request failed");

        return parseResponse(response.body());
    }

    private ProviderResponse parseResponse(String responseBody) {

        JsonObject response =
                JsonParser.parseString(responseBody).getAsJsonObject();

        StringBuilder content = new StringBuilder();

        JsonArray candidates = response.getAsJsonArray("candidates");

        if (candidates != null && !candidates.isEmpty()) {
            JsonObject candidate = candidates.get(0).getAsJsonObject();

            if (candidate.has("content")
                    && candidate.getAsJsonObject("content")
                    .has("parts")) {

                JsonArray parts = candidate.getAsJsonObject("content")
                        .getAsJsonArray("parts");

                for (JsonElement element : parts) {
                    JsonObject part = element.getAsJsonObject();

                    if (part.has("text")
                            && !part.get("text").isJsonNull()) {
                        content.append(part.get("text").getAsString());
                    }
                }
            }
        }

        JsonObject usage = response.has("usageMetadata")
                && response.get("usageMetadata").isJsonObject()
                ? response.getAsJsonObject("usageMetadata")
                : null;

        if (usage == null) {
            throw new IllegalArgumentException(
                    "Gemini response did not include usage metadata"
            );
        }

        long inputTokens = usage.has("promptTokenCount")
                ? usage.get("promptTokenCount").getAsLong()
                : 0;

        long outputTokens = usage.has("candidatesTokenCount")
                ? usage.get("candidatesTokenCount").getAsLong()
                : 0;

        long cachedInputTokens = usage.has("cachedContentTokenCount")
                ? usage.get("cachedContentTokenCount").getAsLong()
                : 0;

        long totalTokens = usage.has("totalTokenCount")
                ? usage.get("totalTokenCount").getAsLong()
                : inputTokens + outputTokens;

        return new ProviderResponse(
                content.isEmpty()
                        ? "No text response generated"
                        : content.toString(),
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

        String model = modelId.startsWith("models/")
                ? modelId.substring("models/".length())
                : modelId;

        String encodedModel = URLEncoder.encode(
                model,
                StandardCharsets.UTF_8
        ).replace("+", "%20");

        HttpResponse<String> response = client.send(
                requestBuilder(
                        api,
                        BASE_URL + "/models/" + encodedModel
                ).GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );

        ensureSuccessful(response, "Failed to fetch Gemini model metadata");

        JsonObject modelInfo =
                JsonParser.parseString(response.body()).getAsJsonObject();

        if (!modelInfo.has("inputTokenLimit")
                || modelInfo.get("inputTokenLimit").isJsonNull()
                || !modelInfo.has("outputTokenLimit")
                || modelInfo.get("outputTokenLimit").isJsonNull()) {

            throw new IllegalArgumentException(
                    "Gemini model metadata is missing token limits"
            );
        }

        return new Modelnfo(
                "Gemini",
                modelId,
                modelInfo.get("inputTokenLimit").getAsLong(),
                modelInfo.get("outputTokenLimit").getAsLong()
        );
    }

    private HttpRequest.Builder requestBuilder(
            API api,
            String url
    ) throws Exception {

        String apiKey = Encrypt.decrypt(
                api.getAPI(),
                api.getSecretKey()
        );

        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("x-goog-api-key", apiKey)
                .header("Content-Type", "application/json");
    }

    private void ensureSuccessful(
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
