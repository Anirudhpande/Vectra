
package com.example.demo.chat.repository;

import com.example.demo.chat.model.ConversationDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository
        extends MongoRepository<ConversationDocument, String> {

    List<ConversationDocument> findAllByOwnerId(String ownerId);

    Optional<ConversationDocument> findByIdAndOwnerId(
            String id,
            String ownerId
    );

    boolean existsByIdAndOwnerId(String id, String ownerId);
}
