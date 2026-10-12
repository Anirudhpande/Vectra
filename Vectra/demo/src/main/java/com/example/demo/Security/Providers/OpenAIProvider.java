package com.example.demo.Security.Providers;

import com.example.demo.Chat.Modelnfo;
import com.example.demo.Model.API;
import com.example.demo.Model.Provider;
import com.example.demo.Security.SecurityLogic.Encrypt;
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
}
