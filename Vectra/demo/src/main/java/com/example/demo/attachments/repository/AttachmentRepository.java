package com.example.demo.attachments.repository;

import com.example.demo.attachments.model.Attachment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AttachmentRepository extends MongoRepository<Attachment, String> {

    List<Attachment> findAllByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Attachment> findByIdAndUserId(
            String id,
            String userId
    );

}
