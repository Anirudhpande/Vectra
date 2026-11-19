package com.example.demo.attachments.storage;

import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.InputStream;

@Repository
public interface AttachmentStorage {
    String store(
            InputStream inputStream,
            String userId,
            String filename
    ) throws IOException;

    InputStream load(String storageKey) throws IOException;

    void delete(String storageKey) throws IOException;
}
