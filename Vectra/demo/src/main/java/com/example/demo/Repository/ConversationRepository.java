
package com.example.demo.Repository;

import com.example.demo.Chat.ConversationDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConversationRepository
        extends MongoRepository<ConversationDocument, String> {
}
