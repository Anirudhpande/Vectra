package com.example.demo.Chat;

import com.example.demo.Model.Message;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class ConversationStore {

    private final ConcurrentMap<String, Conversation> conversations = new ConcurrentHashMap<>();

    public Conversation createConversation() {
        while (true) {
            String conversationId = UUID.randomUUID().toString();
            Conversation conversation = new Conversation(conversationId);

            if (conversations.putIfAbsent(conversationId, conversation) == null) {
                return conversation;
            }
        }
    }

    public Conversation getConversation(String conversationId) {
        return conversations.get(conversationId);
    }

    public static final class Conversation {
        private final String id;
        private final List<Message> messages = new ArrayList<>();

        private Conversation(String id) {
            this.id = id;
        }

        public String getId() {
            return id;
        }

        public synchronized void addMessage(Message message) {
            messages.add(message);
        }

        public synchronized List<Message> getMessages() {
            return List.copyOf(messages);
        }
    }
}
