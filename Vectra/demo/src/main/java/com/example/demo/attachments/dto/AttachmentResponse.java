package com.example.demo.attachments.dto;

import com.example.demo.attachments.model.Attachment;

import java.time.Instant;

public record AttachmentResponse(
        String id,
        String originalFilename,
        String contentType,
        long size,
        Instant createdAt
){
    public static AttachmentResponse from(Attachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getOriginalFilename(),
                attachment.getContentType(),
                attachment.getSize(),
                attachment.getCreatedAt()
        );
    }
}
