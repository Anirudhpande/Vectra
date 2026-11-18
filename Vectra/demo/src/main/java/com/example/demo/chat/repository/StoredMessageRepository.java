
package com.example.demo.chat.repository;

import com.example.demo.chat.model.StoredMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StoredMessageRepository
        extends MongoRepository<StoredMessage, String> {

    List<StoredMessage> findByConversationIdOrderBySequenceAsc(
            String conversationId
    );

    long countByConversationId(String conversationId);

    void deleteByConversationId(String conversationId);
}
