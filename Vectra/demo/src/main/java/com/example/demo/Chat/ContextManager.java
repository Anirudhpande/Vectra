
package com.example.demo.Chat;

import com.example.demo.Model.ContextBudget;
import com.example.demo.Model.Message;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ContextManager {

    private static final double COMPACTION_THRESHOLD = 0.75;
    private static final long DOUBLE_RESERVED_OUTPUT = 2048;

    private final TokenEstimator tokenEstimator;

    public ContextManager(TokenEstimator tokenEstimator) {
        this.tokenEstimator = tokenEstimator;
    }

    public TokenEstimator getTokenEstimator() {
        return tokenEstimator;
    }

    public ContextBudget calculateBudget(
            Modelnfo model,
            List<Message> messages
    ) throws Exception {

        if (model == null) {
            throw new IllegalArgumentException(
                    "Model metadata is required"
            );
        }

        if (messages == null) {
            throw new IllegalArgumentException(
                    "Messages cannot be null"
            );
        }

        long maxContextTokens = model.getMaxContextTokens();
        long maxOutputTokens = model.getMaxOutputTokens();

        if (maxContextTokens <= 0 || maxOutputTokens < 0) {
            throw new IllegalArgumentException(
                    "Model token limits must be valid"
            );
        }

        long reservedOutput = maxOutputTokens > 0
                ? maxOutputTokens
                : DOUBLE_RESERVED_OUTPUT;

        if (reservedOutput >= maxContextTokens) {
            throw new IllegalArgumentException(
                    "Reserved output tokens must be smaller than the context window"
            );
        }

        long availableInputBudget =
                maxContextTokens - reservedOutput;

        long estimatedInputTokens =
                tokenEstimator.estimate(
                        model.getModelId(),
                        messages
                );

        if (estimatedInputTokens < 0) {
            throw new IllegalStateException(
                    "Token estimator returned an invalid token count"
            );
        }

        long threshold = (long) (
                availableInputBudget * COMPACTION_THRESHOLD
        );

        return new ContextBudget(
                maxContextTokens,
                reservedOutput,
                availableInputBudget,
                threshold,
                estimatedInputTokens
        );
    }
}
