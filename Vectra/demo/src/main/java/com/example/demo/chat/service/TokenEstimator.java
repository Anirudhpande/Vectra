package com.example.demo.chat.service;

import com.example.demo.chat.model.Message;

import java.util.List;

public interface TokenEstimator {

    long estimate(String model, List<Message> messages) throws Exception;
}
