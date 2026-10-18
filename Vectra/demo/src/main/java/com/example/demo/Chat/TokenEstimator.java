package com.example.demo.Chat;

import com.example.demo.Model.Message;

import java.util.List;

public interface TokenEstimator {

    long estimate(String model, List<Message> messages) throws Exception;
}
