//package com.example.demo.Chat;
//
//import com.example.demo.Model.Message;
//import org.junit.jupiter.api.Test;
//
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertNotEquals;
//import static org.junit.jupiter.api.Assertions.assertSame;
//
//class ConversationStoreTests {
//
//    @Test
//    void conversationsHaveUniqueIdsAndIsolatedOrderedHistories() {
//        ConversationStore store = new ConversationStore();
//        ConversationStore.Conversation first = store.createConversation();
//        ConversationStore.Conversation second = store.createConversation();
//
//        first.addMessage(new Message("user", "My name is Alex."));
//        first.addMessage(new Message("assistant", "Nice to meet you, Alex."));
//        second.addMessage(new Message("user", "My name is Sam."));
//
//        assertNotEquals(first.getId(), second.getId());
//        assertSame(first, store.getConversation(first.getId()));
//        assertEquals(
//                List.of("My name is Alex.", "Nice to meet you, Alex."),
//                first.getMessages().stream().map(Message::getContent).toList()
//        );
//        assertEquals(
//                List.of("My name is Sam."),
//                second.getMessages().stream().map(Message::getContent).toList()
//        );
//    }
//
//    @Test
//    void removesOnlyThePendingLastMessageAfterProviderFailure() {
//        ConversationStore.Conversation conversation = new ConversationStore().createConversation();
//        Message completedMessage = new Message("user", "Saved message");
//        Message pendingMessage = new Message("user", "Retry this message");
//
//        conversation.addMessage(completedMessage);
//        conversation.addMessage(pendingMessage);
//        conversation.removeLastMessage(pendingMessage);
//
//        assertEquals(List.of(completedMessage), conversation.getMessages());
//    }
//}
