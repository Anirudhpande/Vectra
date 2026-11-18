package com.example.demo.attachments.storage;

import java.io.IOException;
import java.io.InputStream;

public interface AttachmentStorage {
    String store(
            InputStream inputStream,
            String userId,
            String filename
    ) throws IOException;

    InputStream load(String storageKey) throws IOException;

    void delete(String storageKey) throws IOException;
}
