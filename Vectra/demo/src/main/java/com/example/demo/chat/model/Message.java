package com.example.demo.chat.model;

import java.util.List;

public class Message {

    private final String role;
    private final String content;
    private final List<String> attachmentIds;

    public Message(String role, String content) {
        this(role, content, List.of());
    }

    public Message(String role, String content, List<String> attachmentIds){
        this.role = role;
        this.content = content;
        this.attachmentIds = attachmentIds;
    }

    public String getRole() {
        return role;
    }
    public String getContent() {
        return content;
    }
    public List<String> getAttachmentIds(){
        return attachmentIds;
    }
}
