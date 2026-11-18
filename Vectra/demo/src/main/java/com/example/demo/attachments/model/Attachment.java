package com.example.demo.attachments.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "attachments")
public class Attachment {

    @Id
    private String id;
    private String userId;
    private String sourceConversationId;
    private String originalFilename;
    private String contentType;
    private long size;
    private String storageKey;
    private Instant createdAt;

    public Attachment(){

    }

    public Attachment(
            String id,
            String userId,
            String sourceConversationId,
            String originalFilename,
            String contentType,
            long size,
            String storageKey
    ){
        this.id = id;
        this.userId = userId;
        this.sourceConversationId = sourceConversationId;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.size = size;
        this.storageKey = storageKey;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getSourceConversationId() {
        return sourceConversationId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public long getSize() {
        return size;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
