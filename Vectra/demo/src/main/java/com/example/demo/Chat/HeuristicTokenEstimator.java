package com.example.demo.Chat;

import com.example.demo.Model.Message;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class HeuristicTokenEstimator implements TokenEstimator {

    private static final int CHARS_PER_TOKEN = 3;
    private static final int MESSAGE_OVERHEAD_TOKENS = 8;

    @Override
    public long estimate(String model, List<Message> messages) {
        if (messages == null) {
            throw new IllegalArgumentException(
                    "Messages cannot be null"
            );
        }

        long estimatedTokens = 0;

        for (Message message : messages) {
            if (message == null) {
                throw new IllegalArgumentException(
                        "Messages cannot contain null entries"
                );
            }

            long characters =
                    lengthOf(message.getRole())
                            + (long) lengthOf(message.getContent());

            long contentTokens =
                    (characters + CHARS_PER_TOKEN - 1)
                            / CHARS_PER_TOKEN;

            estimatedTokens = Math.addExact(
                    estimatedTokens,
                    contentTokens + MESSAGE_OVERHEAD_TOKENS
            );
        }

        return Math.max(1, estimatedTokens);
    }

    private int lengthOf(String value) {
        return value == null ? 0 : value.length();
    }
}