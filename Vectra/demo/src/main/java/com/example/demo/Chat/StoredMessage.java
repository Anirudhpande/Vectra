
package com.example.demo.Chat;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "messages")
public class StoredMessage {

    @Id
    private String id;

    private String conversationId;
    private long sequence;
    private String role;
    private String content;
    private Instant createdAt;

    public StoredMessage() {
    }

    public StoredMessage(
            String id,
            String conversationId,
            long sequence,
            String role,
            String content
    ) {
        this.id = id;
        this.conversationId = conversationId;
        this.sequence = sequence;
        this.role = role;
        this.content = content;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public long getSequence() {
        return sequence;
    }

    public String getRole() {
        return role;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
