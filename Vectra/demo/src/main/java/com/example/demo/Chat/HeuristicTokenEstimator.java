package com.example.demo.Chat;

import com.example.demo.Model.Message;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * A replaceable approximation based on the KeyCheck strategy: roughly four
 * characters per token, including role text. It is not an exact tokenizer.
 */
@Component
public class HeuristicTokenEstimator implements TokenEstimator {

    @Override
    public long estimate(String model, List<Message> messages) {
        long characters = 0;

        for (Message message : messages) {
            characters += lengthOf(message.getRole());
            characters += lengthOf(message.getContent());
        }

        // Keep the same one-token minimum used by KeyCheck for message framing.
        return Math.max(1, characters / 4);
    }

    private int lengthOf(String value) {
        return value == null ? 0 : value.length();
    }
}
