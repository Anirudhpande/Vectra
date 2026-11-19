package com.example.demo.attachments.service;


import com.example.demo.attachments.model.Attachment;
import com.example.demo.attachments.repository.AttachmentRepository;
import com.example.demo.attachments.storage.AttachmentStorage;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.IllformedLocaleException;
import java.util.List;

@Service
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 10*1024*1024;

    private final AttachmentRepository repository;
    private final AttachmentStorage storage;

    public AttachmentService(
            AttachmentRepository repository,
            AttachmentStorage storage
    ){
        this.repository = repository;
        this.storage = storage;
    }

    public Attachment upload(MultipartFile file, String userId) throws IOException {
        validateFile(file);

        String storageKey = storage.store(
                file.getInputStream(),
                userId,
                file.getOriginalFilename()
        );

        try{
            Attachment attachment = new Attachment(
                    null,
                    userId,
                    null,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize(),
                    storageKey
            );
            return repository.save(attachment);
        } catch (RuntimeException exception) {
            storage.delete(storageKey);
            throw exception;
        }
    }

    public List<Attachment> getUserAttachments(String userId){
        return repository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    public Attachment getAttachment(String attachemnetId, String userId){
        return repository.findByIdAndUserId(attachemnetId, userId).orElseThrow(() ->
                new RuntimeException("Attachment not found"));
    }

    public void deleteAttachemnt(String attachmentId, String userId) throws IOException{

        Attachment attachment = getAttachment(attachmentId, userId);
        storage.delete(attachment.getStorageKey());

        repository.delete(attachment);
    }

    private void validateFile(MultipartFile file){
        if(file == null || file.isEmpty()){
            throw new IllegalArgumentException("File is empty");
        }
        if(file.getSize() > MAX_FILE_SIZE){
            throw new IllegalArgumentException("File exceeds the 10mb limit");
        }

        String contentType = file.getContentType();

        if(contentType == null || !contentType.startsWith("image/"))  {
            throw new IllegalArgumentException("Only image files are supported");
        }
    }

    public InputStream getAttachmentContent(
            String attachmentId,
            String userId
    ) throws IOException {
        Attachment attachment = getAttachment(attachmentId, userId);
        return storage.load(attachment.getStorageKey());
    }
}
