package com.example.demo.Repository;

import com.example.demo.Model.API;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface APIRepository extends MongoRepository<API, String> {

}
