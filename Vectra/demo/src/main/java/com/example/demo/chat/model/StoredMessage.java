
package com.example.demo.chat.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "messages")
public class StoredMessage {

    @Id
    private String id;

    private String conversationId;
    private long sequence;
    private String role;
    private String content;
    private Instant createdAt;
    private List<String> attachmentIds = new ArrayList<>();

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

    public StoredMessage(
            String id,
            String conversationId,
            long sequence,
            String role,
            String content,
            List<String> attachmentsIds
    )
    {
        this.id = id;
        this.conversationId = conversationId;
        this.sequence = sequence;
        this.role = role;
        this.content = content;
        this.attachmentIds = attachmentsIds == null ?  new ArrayList<>() : new ArrayList<>(attachmentsIds);
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

    public List<String> getAttachmentIds(){
        return attachmentIds == null ? List.of() : List.copyOf(attachmentIds);
    }
}
