package com.example.demo.Chat;

import com.example.demo.Model.ContextBudget;
import com.example.demo.Model.Message;

import java.util.List;

public class ContextManager {

    private static final double COMPACTION_THRESHOLD = 0.75;
    private static final long DOUBLE_RESERVED_OUTPUT = 2048;

    private final TokenEstimator tokenEstimator;

    public ContextManager(
            TokenEstimator tokenEstimator
    ){
        this.tokenEstimator = tokenEstimator;
    }

    public TokenEstimator getTokenEstimator() {
        return tokenEstimator;
    }

    public ContextBudget calculateBudget(
            Modelnfo model,
            List<Message> messages
    ) throws Exception{
        long estimatedInputTokens = tokenEstimator.estimate(model.getModelId(), messages);
        long reservedOutput = model.getMaxOutputTokens() > 0 ? model.getMaxOutputTokens() : DOUBLE_RESERVED_OUTPUT;
        long availableInputBudget = model.getMaxContextTokens() - reservedOutput;

        long threshold = (long) (availableInputBudget * COMPACTION_THRESHOLD);

        return new ContextBudget(
                model.getMaxContextTokens(),
                reservedOutput,
                availableInputBudget,
                threshold,
                estimatedInputTokens
        );
    }



}
