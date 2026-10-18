package com.example.demo.Service.Providers;

import com.example.demo.Service.Providers.ProviderResponse;
import com.example.demo.Chat.Modelnfo;
import com.example.demo.Model.API;
import com.example.demo.Model.Message;

import java.util.List;

public interface Provider {

    List<String> getModels(API api) throws Exception;

    ProviderResponse sendRequest();

    ProviderResponse sendRequest(
            API api,
            String selectedModel,
            List<Message> messages
    ) throws Exception;

    Modelnfo getModelInfo(
            API api,
            String modelId
    ) throws Exception;

}
