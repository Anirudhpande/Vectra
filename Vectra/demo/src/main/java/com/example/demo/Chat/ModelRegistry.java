package com.example.demo.Chat;

import org.springframework.boot.Banner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class ModelRegistry {

    private static final long DEFAULT_CONTEXT_TOKENS = 8192;
    private static final long DEFAULT_OUTPUT_TOKENS = 2048;

    private static final Map<String, Modelnfo> models = new HashMap<>();

    public static Modelnfo getModel(
            String provider,
            String modelId
    ){
        String key = provider.toLowerCase() + ":" + modelId;

        Modelnfo model = models.get(key);

        if(model!=null){
            return model;
        }

        return new Modelnfo(
                provider,
                modelId,
                DEFAULT_CONTEXT_TOKENS,
                DEFAULT_OUTPUT_TOKENS
        );
    }

    public static void register(Modelnfo model){
        String key = model.getProvider().toLowerCase() + ":" + model.getModelId();
        models.put(key,model);
    }
}
