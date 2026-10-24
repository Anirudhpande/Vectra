package com.example.demo.Chat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ModelMetadataConfig {

    @Value("${vectra.context.fallback-max-context-tokens:16384}")
    private long fallbackMaxContextTokens;

    @Value("${vectra.context.fallback-max-output-tokens:2048}")
    private long fallbackMaxOutputTokens;

    public Modelnfo getFallbackModelInfo(
            String provider,
            String modelId
    ) {
        if (fallbackMaxContextTokens <= fallbackMaxOutputTokens
                || fallbackMaxOutputTokens <= 0) {
            throw new IllegalStateException(
                    "Invalid fallback model token configuration"
            );
        }

        return new Modelnfo(
                provider,
                modelId,
                fallbackMaxContextTokens,
                fallbackMaxOutputTokens
        );
    }
}