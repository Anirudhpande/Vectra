package com.example.demo.Chat;

import com.example.demo.Model.API;
import com.example.demo.Service.Providers.Provider;

import java.sql.PreparedStatement;

public class ChatService {

    private final Provider provider;
    private final API api;
    private final String message;
    private final ContextManager contextManager;

    public ChatService(
            Provider provider,
            API api,
            String message,
            ContextManager contextManager
    ){
        this.provider = provider;
        this.api = api;
        this.message = message;
        this.contextManager = contextManager;
    }






}
