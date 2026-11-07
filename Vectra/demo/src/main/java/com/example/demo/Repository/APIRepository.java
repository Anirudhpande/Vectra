package com.example.demo.Repository;

import com.example.demo.Model.API;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface APIRepository extends MongoRepository<API, String> {

    List<API> findByOwnerId(String ownderID);

    Optional<API> findByIdAndOwnerId(String id, String ownerId);

}
