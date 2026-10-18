package com.example.demo.Model;

import java.util.ArrayList;
import java.util.List;

public class ConversationContext {

    private String summary;
    private final List<Message> messages;

    public ConversationContext(){
        this.summary = "";
        this.messages = new ArrayList<>();
    }

    public String getSummary(){
        return summary;
    }

    public void serSummary(String summary){
        this.summary = summary;
    }

    public List<Message> getMessages(){
        return messages;
    }

    public void addMessages(Message message){
        messages.add(message);
    }

    public List<Message> getMessagesWithSummary(){
        List<Message> context = new ArrayList<>();

        if(summary != null && !summary.isBlank()){
            context.add(
                    new Message(
                            "system", "Conversation summary:\n" + summary
                    )
            );
        }

        context.addAll(messages);

        return context;
    }

}
