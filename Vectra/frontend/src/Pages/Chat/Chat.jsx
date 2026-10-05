import React from 'react'

const Chat = () => {

  const chats = [
  {
    "role": "user",
    "message": "Hey, what is an API?"
  },
  {
    "role": "assistant",
    "message": "An API is a way for two software applications to communicate with each other."
  },
  {
    "role": "user",
    "message": "Can you give me a simple example?"
  },
  {
    "role": "assistant",
    "message": "Sure. A weather app can use a weather API to request weather data from a server and display it to you."
  },
  {
    "role": "user",
    "message": "So the API acts like a middleman?"
  },
  {
    "role": "assistant",
    "message": "Exactly. It takes a request from one application, sends it to another system, and returns the response."
  }
]

  return (
    <div>

      

    </div>
  )
}

export default Chat