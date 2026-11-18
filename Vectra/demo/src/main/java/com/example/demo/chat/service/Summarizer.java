package com.example.demo.chat.service;

import com.example.demo.chat.model.Message;

import java.util.List;

public interface Summarizer {

    String summarize(String existingSummary, List<Message> messages) throws Exception;
}
