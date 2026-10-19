package com.example.demo.Chat;

import java.util.HashMap;
import java.util.Map;

public class ModelRegistry {

    private static final Map<String, Modelnfo> models = new HashMap<>();

    public static Modelnfo getModel(
            String provider,
            String modelId
    ){
        String key = provider.toLowerCase() + ":" + modelId;

        Modelnfo model = models.get(key);

        return model;
    }

    public static void register(Modelnfo model){
        String key = model.getProvider().toLowerCase() + ":" + model.getModelId();
        models.put(key,model);
    }
}
