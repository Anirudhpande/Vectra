package com.example.demo.attachments.storage;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class LocalAttachmentStorage implements AttachmentStorage {

    private final Path rootLocation;

    public LocalAttachmentStorage(
            @Value("${vectra.storage.local-path:uploads}") String storagePath
    ) throws IOException{
        this.rootLocation = Paths.get(storagePath)
                .toAbsolutePath().normalize();

        Files.createDirectories(rootLocation);
    }


    @Override
    public String store(
            InputStream inputStream,
            String userId,
            String filename
    ) throws IOException{

        String storageKey = userId + "/" + UUID.randomUUID();
        Path destination = rootLocation.resolve(storageKey).normalize();

        if(!destination.startsWith(rootLocation)){
            throw new IOException("Invalid storage path");
        }

        Files.createDirectories(destination.getParent());

        Files.copy(
                inputStream,
                destination,
                StandardCopyOption.REPLACE_EXISTING
        );
        return storageKey;
    }

    @Override
    public InputStream load(String storageKey) throws IOException {

        Path filePath = rootLocation.resolve(storageKey).normalize();

        if(!filePath.startsWith(rootLocation)){
            throw new IOException("Invalid storage path");
        }

        return Files.newInputStream(filePath);
    }

    @Override
    public void delete(String storageKey) throws IOException {

        Path filePath = rootLocation.resolve(storageKey).normalize();

        if(!filePath.startsWith(rootLocation)){
            throw new IOException("Invalid Storage path");
        }

        Files.deleteIfExists(filePath);
    }
}
