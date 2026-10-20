
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

        List<StoredMessage> pendingMessages =
                conversation.getUncompactedStoredMessages();

        List<Message> messages = pendingMessages.stream()
                .map(stored -> new Message(
                        stored.getRole(),
                        stored.getContent()
                ))
                .toList();

        int splitIndex = findSplitIndex(
                messages,
                modelId,
                targetRecentTokens
        );

        if (splitIndex <= 0) {
            return false;
        }

        List<Message> messagesToCompact =
                new ArrayList<>(messages.subList(0, splitIndex));

        List<Message> recentMessages =
                new ArrayList<>(messages.subList(splitIndex, messages.size()));

        String summary = summarizer.summarize(
                conversation.getSummary(),
                messagesToCompact
        );

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

        return true;
    }

    private int findSplitIndex(
            List<Message> messages,
            String modelId,
            long targetRecentTokens
    ) throws Exception {

        for (int index = 1; index < messages.size(); index++) {
            List<Message> recentMessages =
                    messages.subList(index, messages.size());

            if (tokenEstimator.estimate(modelId, recentMessages)
                    <= targetRecentTokens) {
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

        String candidate = summary;

        while (estimateContext(modelId, candidate, recentMessages)
                > availableInputTokens) {

            if (candidate.length() <= 1) {
                throw new ContextLimitExceededException(
                        "Compacted context still exceeds the model input budget"
                );
            }

            candidate = candidate.substring(
                    0,
                    Math.max(1, candidate.length() / 2)
            );
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
