
package com.example.demo.Chat;

import com.example.demo.Model.Message;
import com.example.demo.Model.User;
import com.example.demo.Auth.CurrentUserService;
import com.example.demo.Repository.ConversationRepository;
import com.example.demo.Repository.StoredMessageRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class ConversationStore {

    private final ConversationRepository conversationRepository;
    private final StoredMessageRepository messageRepository;
    private final CurrentUserService currentUserService;

    public ConversationStore(
            ConversationRepository conversationRepository,
            StoredMessageRepository messageRepository,
            CurrentUserService currentUserService
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.currentUserService = currentUserService;
    }

    // Create conversation for authenticated user
    public Conversation createConversation(Authentication authentication) {

        User currentUser = currentUserService.getCurrentUser(authentication);

        String id = UUID.randomUUID().toString();

        ConversationDocument document =
                new ConversationDocument(id, currentUser.getId());

        conversationRepository.save(document);

        return new Conversation(id, currentUser.getId());
    }

    // Retrieve conversation only if user owns it
    public Conversation getConversation(
            String conversationId,
            Authentication authentication
    ) {

        User currentUser = currentUserService.getCurrentUser(authentication);

        boolean exists = conversationRepository
                .existsByIdAndOwnerId(conversationId, currentUser.getId());

        if (!exists) {
            return null;
        }

        return new Conversation(conversationId, currentUser.getId());
    }

    // Retrieve only authenticated user's conversations
    public List<ConversationSummary> getAllConversations(
            Authentication authentication
    ) {

        User currentUser = currentUserService.getCurrentUser(authentication);

        return conversationRepository.findAllByOwnerId(currentUser.getId())
                .stream()
                .map(document -> new ConversationSummary(
                        document.getId(),
                        document.getTitle(),
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

    // Retrieve messages only if user owns conversation
    public List<Message> getMessages(
            String conversationId,
            Authentication authentication
    ) {

        Conversation conversation =
                getConversation(conversationId, authentication);

        if (conversation == null) {
            return null;
        }

        return conversation.getMessages();
    }

    // Delete only authenticated user's conversation
    public boolean deleteConversation(
            String conversationId,
            Authentication authentication
    ) {

        User currentUser = currentUserService.getCurrentUser(authentication);

        ConversationDocument document = conversationRepository
                .findByIdAndOwnerId(conversationId, currentUser.getId())
                .orElse(null);

        if (document == null) {
            return false;
        }

        messageRepository.deleteByConversationId(conversationId);
        conversationRepository.delete(document);

        return true;
    }

    public final class Conversation {

        private final String id;
        private final String ownerId;

        private Conversation(String id, String ownerId) {
            this.id = id;
            this.ownerId = ownerId;
        }

        public String getId() {
            return id;
        }

        public synchronized void addMessage(Message message) {
            ConversationDocument document = getDocument();

            if ("user".equals(message.getRole())
                    && (document.getTitle() == null
                    || document.getTitle().isBlank())) {
                document.setTitle(createTitle(message.getContent()));
            }

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

        public synchronized String getTitle() {
            return getDocument().getTitle();
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

        public synchronized CompactionState snapshotCompactionState() {
            ConversationDocument document = getDocument();

            return new CompactionState(
                    document.getSummary(),
                    document.getTitle(),
                    document.getCompactedThroughSequence(),
                    document.getUpdatedAt()
            );
        }

        public synchronized void restoreCompactionState(
                CompactionState state
        ) {
            if (state == null) {
                throw new IllegalArgumentException(
                        "Compaction state cannot be null"
                );
            }

            ConversationDocument document = getDocument();

            document.setSummary(state.summary());
            document.setTitle(state.title());
            document.setCompactedThroughSequence(
                    state.compactedThroughSequence()
            );
            document.setUpdatedAt(state.updatedAt());

            conversationRepository.save(document);
        }

        private ConversationDocument getDocument() {
            return conversationRepository
                    .findByIdAndOwnerId(id, ownerId)
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Conversation not found: " + id
                            )
                    );
        }

        private String createTitle(String content) {
            if (content == null || content.isBlank()) {
                return "New conversation";
            }

            String normalized = content.trim().replaceAll("\\s+", " ");
            int maximumLength = 60;

            return normalized.length() <= maximumLength
                    ? normalized
                    : normalized.substring(0, maximumLength - 1) + "…";
        }
    }

    public record CompactionState(
            String summary,
            String title,
            long compactedThroughSequence,
            Instant updatedAt
    ) {}
}
