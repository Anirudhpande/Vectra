//package com.example.demo.Chat;
//
//import com.example.demo.Model.ContextBudget;
//import com.example.demo.Model.Message;
//import com.example.demo.Model.API;
//import com.example.demo.Service.Providers.Provider;
//import com.example.demo.Service.Providers.ProviderResponse;
//import org.junit.jupiter.api.Test;
//
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertFalse;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//
//class ContextManagementTests {
//
//    private final HeuristicTokenEstimator estimator = new HeuristicTokenEstimator();
//
//    @Test
//    void estimatesEmptyAndNonEmptyHistoriesUsingKeyCheckHeuristic() throws Exception {
//        assertEquals(1, estimator.estimate("gpt-4.1", List.of()));
//        assertEquals(
//                3,
//                estimator.estimate("gpt-4.1", List.of(new Message("user", "hello world")))
//        );
//    }
//
//    @Test
//    void calculatesBudgetWithReservedOutputAndKeyCheckThreshold() throws Exception {
//        ContextManager contextManager = new ContextManager(estimator);
//        Modelnfo model = new Modelnfo("OpenAI", "test", 100, 20);
//
//        ContextBudget budget = contextManager.calculateBudget(
//                model,
//                List.of(new Message("user", "x".repeat(240)))
//        );
//
//        assertEquals(80, budget.getAvailableInputTokens());
//        assertEquals(60, budget.getCompactionThreshold());
//        assertTrue(budget.shouldCompact());
//    }
//
//    @Test
//    void compactionStoresInternalSummaryAndPreservesRecentMessageOrder() throws Exception {
//        ConversationStore.Conversation conversation = new ConversationStore().createConversation();
//        conversation.addMessage(new Message("user", "older one"));
//        conversation.addMessage(new Message("assistant", "older two"));
//        conversation.addMessage(new Message("user", "recent"));
//
//        new CompactionService(estimator).compact(
//                conversation,
//                "test",
//                3,
//                100,
//                (summary, messages) -> "summary of old messages"
//        );
//
//        assertEquals("summary of old messages", conversation.getSummary());
//        assertEquals(List.of("recent"), contents(conversation.getMessages()));
//        assertEquals("system", conversation.getMessagesWithSummary().getFirst().getRole());
//        assertFalse(contents(conversation.getMessages()).contains("summary of old messages"));
//    }
//
//    @Test
//    void summarizationFailureDoesNotDiscardOriginalMessages() {
//        ConversationStore.Conversation conversation = new ConversationStore().createConversation();
//        conversation.addMessage(new Message("user", "older"));
//        conversation.addMessage(new Message("user", "recent"));
//
//        assertThrows(Exception.class, () -> new CompactionService(estimator).compact(
//                conversation,
//                "test",
//                2,
//                100,
//                (summary, messages) -> {
//                    throw new IllegalStateException("provider unavailable");
//                }
//        ));
//
//        assertEquals(List.of("older", "recent"), contents(conversation.getMessages()));
//        assertTrue(conversation.getSummary().isBlank());
//    }
//
//    @Test
//    void compactedContextIsSentOnceToTheProvider() throws Exception {
//        ConversationStore.Conversation conversation = new ConversationStore().createConversation();
//        conversation.addMessage(new Message("user", "a".repeat(120)));
//        conversation.addMessage(new Message("assistant", "b".repeat(120)));
//        conversation.addMessage(new Message("user", "c".repeat(120)));
//
//        RecordingProvider provider = new RecordingProvider();
//        ChatService chatService = new ChatService(
//                provider,
//                null,
//                "ignored",
//                new ContextManager(estimator),
//                new CompactionService(estimator)
//        );
//
//        ProviderResponse response = chatService.sendMessage(
//                new Modelnfo("OpenAI", "test", 100, 20),
//                conversation
//        );
//
//        assertEquals("reply", response.getContent());
//        assertEquals(2, provider.calls);
//        assertEquals("system", provider.chatMessages.getFirst().getRole());
//        assertEquals(List.of("c".repeat(120)), contents(conversation.getMessages()));
//        assertFalse(conversation.getSummary().isBlank());
//    }
//
//    private List<String> contents(List<Message> messages) {
//        return messages.stream().map(Message::getContent).toList();
//    }
//
//    private static final class RecordingProvider implements Provider {
//        private int calls;
//        private List<Message> chatMessages;
//
//        @Override
//        public List<String> getModels(API api) {
//            return List.of();
//        }
//
//        @Override
//        public ProviderResponse sendRequest() {
//            return null;
//        }
//
//        @Override
//        public ProviderResponse sendRequest(API api, String model, List<Message> messages) {
//            calls++;
//            if (calls == 1) {
//                return new ProviderResponse("summary", null);
//            }
//
//            chatMessages = messages;
//            return new ProviderResponse("reply", null);
//        }
//
//        @Override
//        public Modelnfo getModelInfo(API api, String modelId) {
//            return null;
//        }
//    }
//}
