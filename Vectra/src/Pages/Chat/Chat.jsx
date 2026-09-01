import React from "react";
import Sidebar from "./Components/Sidebar";
import Chats from "./Components/Chats";
import ChatInput from "./Components/ChatInput";

const Chat = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-row">
      <div>
        <Sidebar />
      </div>

      <div className="flex flex-col">  
        <Chats />
        <ChatInput />
      </div>

      
    </div> 
  );
};

export default Chat;