package com.example.demo.Model;

import com.example.demo.Chat.Modelnfo;

import java.util.List;

public interface Provider {



    List<String> getModels(API api) throws Exception;

    Modelnfo getModelInfo(
            API api,
            String modelId
    ) throws Exception;
}
