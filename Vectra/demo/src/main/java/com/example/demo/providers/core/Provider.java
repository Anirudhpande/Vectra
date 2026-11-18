package com.example.demo.providers.core;

import com.example.demo.providers.core.ProviderResponse;
import com.example.demo.chat.service.Modelnfo;
import com.example.demo.credentials.model.API;
import com.example.demo.chat.model.Message;

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
