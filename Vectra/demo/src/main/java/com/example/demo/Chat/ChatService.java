package com.example.demo.Chat;

import com.example.demo.Model.API;
import com.example.demo.Model.Message;
import com.example.demo.Service.Providers.Provider;
import com.example.demo.Service.Providers.ProviderResponse;
import java.util.ArrayList;
import java.util.List;


public class ChatService {

    private final Provider provider;
    private final API api;
    private final String message;

    public ChatService(
            Provider provider,
            API api,
            String message
    ){
        this.provider = provider;
        this.api = api;
        this.message = message;
    }

    public ProviderResponse sendMessage(String selectedModel) throws Exception {

        List<Message> messages = new ArrayList<>();

        messages.add(new Message("user", message));

        return sendMessage(selectedModel, messages);
    }

    public ProviderResponse sendMessage(
            String selectedModel,
            List<Message> messages
    ) throws Exception {
        return provider.sendRequest(
                api,
                selectedModel,
                messages
        );
    }




}
