package com.example.demo.Chat;

import com.example.demo.Model.Message;

import java.util.List;

public interface Summarizer {

    String summarize(String existingSummary, List<Message> messages) throws Exception;
}
