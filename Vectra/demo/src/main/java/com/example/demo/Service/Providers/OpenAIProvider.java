package com.example.demo.Service.Providers;

import com.example.demo.Chat.Modelnfo;
import com.example.demo.Model.API;
import com.example.demo.Model.Message;
import com.example.demo.Model.TokenUsage;
import com.example.demo.Security.SecurityLogic.Encrypt;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import com.google.gson.JsonParser;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Component
public class OpenAIProvider implements Provider {
    private final HttpClient client = HttpClient.newHttpClient();

    @Override
    public List<String> getModels(API api) throws Exception{
        String apiKey = Encrypt.decrypt(api.getAPI(), api.getSecretKey());

        HttpRequest request = HttpRequest.newBuilder()
                .uri(
                        URI.create("https://api.openai.com/v1/models")
                )
                .header(
                        api.getAuthHeader(),
                        api.getAuthPrefix() + apiKey
                )
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        if(response.statusCode()!=200){
            throw new Exception("Failed to fetch OpenAI models" + response.body());
        }

        return parseModels(response.body());
    }

    private List<String> parseModels(String responseBody){
        JsonObject json = JsonParser.parseString(responseBody).getAsJsonObject();

        var data = json.getAsJsonArray("data");

        List<String> models = new ArrayList<>();

        data.forEach(element -> {
            JsonObject model = element.getAsJsonObject();
            models.add(model.get("id").getAsString());
        });

        return models;
    }

    @Override
    public Modelnfo getModelInfo(
            API api,
            String modelId
    ) throws Exception {

        switch (modelId){

            case "gpt-5.6-sol":
            case "gpt-5.6", "gpt-5.6-terra", "gpt-5.6-luna":
                return new Modelnfo(
                        "OpenAI",
                        modelId,
                        1050000,
                        128000
                );

            default:
                throw new Exception("OpenAI model metadata not configured: " + modelId);

        }
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
    ) throws Exception{

        String apiKey = Encrypt.decrypt(
                api.getAPI(),
                api.getSecretKey()
        );

        JsonObject json = new JsonObject();

        json.addProperty("model", selectedModel);

        JsonArray input = new JsonArray();

        for(Message message: messages){
            JsonObject item = new JsonObject();
            item.addProperty("role", message.getRole());
            item.addProperty("content", message.getContent());
            input.add(item);
        }

        json.add("input", input);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/responses"))
                .header(
                        api.getAuthHeader(),
                        api.getAuthPrefix() + apiKey
                )
                .headers("Content-Type",
                        "application/json")
                .POST(
                        HttpRequest.BodyPublishers.ofString(json.toString())
                )
                .build();

        HttpResponse<String> response = client.send(
                request, HttpResponse.BodyHandlers.ofString()
        );

        return parseResponse(response.body());

    }

    private ProviderResponse parseResponse(String responseBddy) {
        JsonObject json = JsonParser.parseString(responseBddy).getAsJsonObject();

        String answer = "";

        if(json.has("output_text")){
            answer = json.get("output_text").getAsString();
        }else{
            var output = json.getAsJsonArray("output");

            for(var element: output){
                JsonObject outputItem = element.getAsJsonObject();

                if(!outputItem.has("content")){
                    continue;
                }

                var content = outputItem.getAsJsonArray("content");

                for(var contentElement: content){

                    JsonObject contentItem = contentElement.getAsJsonObject();

                    if(contentItem.has("text")){
                        answer = contentItem.get("text").getAsString();
                        break;
                    }
                }
                if(!answer.isEmpty()){
                    break;
                }
            }
        }

        JsonObject usage = json.getAsJsonObject("usage");
        long inputTokens = usage.get("input_tokens").getAsLong();
        long outputTokens = usage.get("output_tokens").getAsLong();
        long totalTokens = usage.get("total_tokens").getAsLong();

        long cachedInputTokens = 0;

        if(usage.has("input_token_details")){
            JsonObject inputDetails = usage.getAsJsonObject("input_token_details");

            if(inputDetails.has("cached_tokens")){
                cachedInputTokens = inputDetails.get("cached_tokens").getAsLong();
            }
        }

        TokenUsage tokenUsage = new TokenUsage(
                inputTokens,
                outputTokens,
                cachedInputTokens,
                totalTokens
        );
        return new ProviderResponse(
                answer.isEmpty()? "No text response found":answer, tokenUsage
        );

    }


}
