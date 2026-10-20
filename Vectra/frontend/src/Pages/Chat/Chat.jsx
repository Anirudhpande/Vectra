import React, { useState } from 'react'

import { AccountDetails } from './Components/AccountDetails'
import ChatManager from './Components/ChatManager'
import { ChatFlow } from './Components/ChatFlow'

const Chat = () => {
  const [activeConversation, setActiveConversation] = useState(null)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#1D1F2B]">
      <AccountDetails className="w-1/8" />

      <ChatManager
        className="w-2/8"
        onSelectConversation={setActiveConversation}
        onNewConversation={setActiveConversation}
      />

      <ChatFlow
        className="w-2/4"
        conversation={activeConversation}
      />
    </div>
  )
}

export default Chat