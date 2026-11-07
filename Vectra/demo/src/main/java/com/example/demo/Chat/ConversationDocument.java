
package com.example.demo.Chat;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "conversations")
public class ConversationDocument {

    @Id
    private String id;

    private String ownerId;

    private long compactedThroughSequence = -1;
    private String summary = "";
    private long nextSequence = 0;

    private Instant createdAt;
    private Instant updatedAt;

    public ConversationDocument() {
    }

    public ConversationDocument(String id, String ownerId) {
        this.id = id;
        this.ownerId = ownerId;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public String getId() {
        return id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public long getNextSequence() {
        return nextSequence;
    }

    public void setNextSequence(long nextSequence) {
        this.nextSequence = nextSequence;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public long getCompactedThroughSequence() {
        return compactedThroughSequence;
    }

    public void setCompactedThroughSequence(long compactedThroughSequence) {
        this.compactedThroughSequence = compactedThroughSequence;
    }
}
