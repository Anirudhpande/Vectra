package com.example.demo.chat.service;

public class ContextLimitExceededException extends Exception {

    public ContextLimitExceededException(String message) {
        super(message);
    }
}
