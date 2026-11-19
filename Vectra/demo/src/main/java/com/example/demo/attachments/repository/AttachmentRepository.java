package com.example.demo.attachments.repository;

import com.example.demo.attachments.model.Attachment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends MongoRepository<Attachment, String> {

    List<Attachment> findAllByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Attachment> findByIdAndUserId(
            String id,
            String userId
    );

}
