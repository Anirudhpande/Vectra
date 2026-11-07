
package com.example.demo.Chat;

import java.time.Instant;

public class ConversationSummary {

    private final String id;
    private final String title;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final long messageCount;

    public ConversationSummary(
            String id,
            String title,
            Instant createdAt,
            Instant updatedAt,
            long messageCount
    ) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.messageCount = messageCount;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public long getMessageCount() {
        return messageCount;
    }
}
