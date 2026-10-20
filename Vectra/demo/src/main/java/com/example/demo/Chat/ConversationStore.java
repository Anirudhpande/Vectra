
package com.example.demo.Chat;

import com.example.demo.Model.Message;
import com.example.demo.Repository.ConversationRepository;
import com.example.demo.Repository.StoredMessageRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class ConversationStore {

    private final ConversationRepository conversationRepository;
    private final StoredMessageRepository messageRepository;

    public ConversationStore(
            ConversationRepository conversationRepository,
            StoredMessageRepository messageRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    public Conversation createConversation() {
        String id = UUID.randomUUID().toString();

        ConversationDocument document = new ConversationDocument(id);
        conversationRepository.save(document);

        return new Conversation(id);
    }

    public Conversation getConversation(String conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            return null;
        }

        return new Conversation(conversationId);
    }

    // Get all conversations, newest activity first
    public List<ConversationSummary> getAllConversations() {
        return conversationRepository.findAll()
                .stream()
                .map(document -> new ConversationSummary(
                        document.getId(),
                        document.getSummary(),
                        document.getCreatedAt(),
                        document.getUpdatedAt(),
                        messageRepository.countByConversationId(
                                document.getId()
                        )
                ))
                .sorted((a, b) ->
                        b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .toList();
    }

    // Get the complete original message history
    public List<Message> getMessages(String conversationId) {
        Conversation conversation = getConversation(conversationId);

        if (conversation == null) {
            return null;
        }

        return conversation.getMessages();
    }

    public boolean deleteConversation(String conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            return false;
        }

        messageRepository.deleteByConversationId(conversationId);
        conversationRepository.deleteById(conversationId);

        return true;
    }

    public final class Conversation {

        private final String id;

        private Conversation(String id) {
            this.id = id;
        }

        public String getId() {
            return id;
        }

        public synchronized void addMessage(Message message) {
            ConversationDocument document = getDocument();

            long sequence = document.getNextSequence();

            StoredMessage storedMessage = new StoredMessage(
                    UUID.randomUUID().toString(),
                    id,
                    sequence,
                    message.getRole(),
                    message.getContent()
            );

            messageRepository.save(storedMessage);

            document.setNextSequence(sequence + 1);
            document.setUpdatedAt(Instant.now());

            conversationRepository.save(document);
        }

        public synchronized List<Message> getMessages() {
            return messageRepository
                    .findByConversationIdOrderBySequenceAsc(id)
                    .stream()
                    .map(message -> new Message(
                            message.getRole(),
                            message.getContent()
                    ))
                    .toList();
        }

        public synchronized String getSummary() {
            return getDocument().getSummary();
        }

        public synchronized List<Message> getMessagesWithSummary() {
            ConversationDocument document = getDocument();

            List<Message> context = new ArrayList<>();

            String summary = document.getSummary();

            if (summary != null && !summary.isBlank()) {
                context.add(new Message(
                        "system",
                        "Conversation summary:\n" + summary
                ));
            }

            List<StoredMessage> recentMessages = messageRepository
                    .findByConversationIdOrderBySequenceAsc(id)
                    .stream()
                    .filter(message ->
                            message.getSequence()
                                    > document.getCompactedThroughSequence()
                    )
                    .toList();

            for (StoredMessage stored : recentMessages) {
                context.add(new Message(
                        stored.getRole(),
                        stored.getContent()
                ));
            }

            return List.copyOf(context);
        }

        public synchronized void replaceWithCompactedContext(
                String newSummary,
                long compactedThroughSequence
        ) {
            ConversationDocument document = getDocument();

            if (compactedThroughSequence
                    < document.getCompactedThroughSequence()) {
                throw new IllegalArgumentException(
                        "Compaction boundary cannot move backwards"
                );
            }

            document.setSummary(newSummary);
            document.setCompactedThroughSequence(
                    compactedThroughSequence
            );
            document.setUpdatedAt(Instant.now());

            conversationRepository.save(document);
        }

        public synchronized void removeLastMessage(Message message) {
            List<StoredMessage> storedMessages = messageRepository
                    .findByConversationIdOrderBySequenceAsc(id);

            if (storedMessages.isEmpty()) {
                return;
            }

            StoredMessage last =
                    storedMessages.get(storedMessages.size() - 1);

            if (last.getRole().equals(message.getRole())
                    && last.getContent().equals(message.getContent())) {
                messageRepository.delete(last);
            }
        }

        public synchronized List<StoredMessage>
        getUncompactedStoredMessages() {
            ConversationDocument document = getDocument();

            return messageRepository
                    .findByConversationIdOrderBySequenceAsc(id)
                    .stream()
                    .filter(message ->
                            message.getSequence()
                                    > document.getCompactedThroughSequence()
                    )
                    .toList();
        }

        private ConversationDocument getDocument() {
            return conversationRepository.findById(id)
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Conversation not found: " + id
                            )
                    );
        }
    }
}
