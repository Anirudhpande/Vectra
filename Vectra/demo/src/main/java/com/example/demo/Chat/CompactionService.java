
package com.example.demo.Chat;

import com.example.demo.Model.Message;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CompactionService {

    private final TokenEstimator tokenEstimator;

    public CompactionService(TokenEstimator tokenEstimator) {
        this.tokenEstimator = tokenEstimator;
    }

    public boolean compact(
            ConversationStore.Conversation conversation,
            String modelId,
            long targetRecentTokens,
            long availableInputTokens,
            Summarizer summarizer
    ) throws Exception {

        if (conversation == null) {
            throw new IllegalArgumentException(
                    "Conversation is required"
            );
        }

        if (modelId == null || modelId.isBlank()) {
            throw new IllegalArgumentException(
                    "Model ID is required"
            );
        }

        if (summarizer == null) {
            throw new IllegalArgumentException(
                    "Summarizer is required"
            );
        }

        if (targetRecentTokens <= 0 || availableInputTokens <= 0) {
            throw new IllegalArgumentException(
                    "Token budgets must be positive"
            );
        }

        List<StoredMessage> pendingMessages =
                conversation.getUncompactedStoredMessages();

        if (pendingMessages == null || pendingMessages.size() < 2) {
            return false;
        }

        List<Message> messages = pendingMessages.stream()
                .map(stored -> new Message(
                        stored.getRole(),
                        stored.getContent()
                ))
                .toList();

        // First try the preferred recent-message budget.
        int splitIndex = findSplitIndex(
                messages,
                modelId,
                targetRecentTokens
        );

        // If that fails, allow a larger recent suffix up to the
        // complete available input budget.
        if (splitIndex <= 0) {
            splitIndex = findSplitIndex(
                    messages,
                    modelId,
                    availableInputTokens
            );
        }

        if (splitIndex <= 0) {
            // Even the newest message cannot fit within the available
            // input budget. Summarizing older messages won't fix that.
            return false;
        }

        List<Message> messagesToCompact =
                new ArrayList<>(messages.subList(0, splitIndex));

        List<Message> recentMessages =
                new ArrayList<>(messages.subList(
                        splitIndex,
                        messages.size()
                ));

        String summary = summarizer.summarize(
                conversation.getSummary(),
                messagesToCompact
        );

        if (summary == null) {
            summary = "";
        }

        summary = fitSummaryToBudget(
                summary,
                recentMessages,
                modelId,
                availableInputTokens
        );

        long compactedThroughSequence =
                pendingMessages.get(splitIndex - 1).getSequence();

        conversation.replaceWithCompactedContext(
                summary,
                compactedThroughSequence
        );

        // Verify the actual persisted context before reporting success.
        List<Message> compactedContext =
                conversation.getMessagesWithSummary();

        long estimatedTokens =
                tokenEstimator.estimate(modelId, compactedContext);

        if (estimatedTokens > availableInputTokens) {
            throw new ContextLimitExceededException(
                    "Compacted context still exceeds the input budget. "
                            + "Estimated input tokens: "
                            + estimatedTokens
                            + ", available input tokens: "
                            + availableInputTokens
            );
        }

        return true;
    }

    private int findSplitIndex(
            List<Message> messages,
            String modelId,
            long targetRecentTokens
    ) throws Exception {

        if (messages == null || messages.size() < 2) {
            return 0;
        }

        // Start at index 1 so at least one message is compacted
        // and at least one recent message is retained.
        for (int index = 1; index < messages.size(); index++) {

            List<Message> recentMessages =
                    messages.subList(index, messages.size());

            long estimatedTokens =
                    tokenEstimator.estimate(modelId, recentMessages);

            if (estimatedTokens <= targetRecentTokens) {
                return index;
            }
        }

        return 0;
    }

    private String fitSummaryToBudget(
            String summary,
            List<Message> recentMessages,
            String modelId,
            long availableInputTokens
    ) throws Exception {

        String candidate = summary == null ? "" : summary;

        // First check whether the recent messages themselves fit.
        long recentTokens = tokenEstimator.estimate(
                modelId,
                recentMessages
        );

        if (recentTokens > availableInputTokens) {
            throw new ContextLimitExceededException(
                    "Recent messages alone exceed the available input "
                            + "budget. Estimated tokens: "
                            + recentTokens
                            + ", available input tokens: "
                            + availableInputTokens
            );
        }

        while (estimateContext(
                modelId,
                candidate,
                recentMessages
        ) > availableInputTokens) {

            if (candidate.isEmpty()) {
                throw new ContextLimitExceededException(
                        "Recent messages and the required context "
                                + "overhead exceed the input budget"
                );
            }

            // Reduce the summary gradually rather than repeatedly
            // cutting it in half and potentially losing all useful detail.
            int newLength = Math.max(0, candidate.length() * 3 / 4);

            if (newLength >= candidate.length()) {
                newLength = candidate.length() - 1;
            }

            candidate = candidate.substring(0, newLength);
        }

        return candidate;
    }

    private long estimateContext(
            String modelId,
            String summary,
            List<Message> recentMessages
    ) throws Exception {

        List<Message> context = new ArrayList<>();

        if (summary != null && !summary.isBlank()) {
            context.add(new Message(
                    "system",
                    "Conversation summary:\n" + summary
            ));
        }

        context.addAll(recentMessages);

        return tokenEstimator.estimate(modelId, context);
    }
}
