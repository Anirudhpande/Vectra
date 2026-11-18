package com.example.demo.user.repository;

import com.example.demo.user.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByProviderAndProviderID(
            String provider,
            String providerID
    );
}
