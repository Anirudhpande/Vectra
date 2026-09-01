import React, { useEffect, useRef } from "react";
import VectraLogo from "../../../assets/VectraLogo.png";

const Chats = () => {
  const messages = [
    {
      id: 1,
      role: "user",
      content: "Explain recursion to me",
    },
    {
      id: 2,
      role: "assistant",
      content:
        "Recursion is when a function calls itself to solve a smaller version of the same problem.",
    },
    {
      id: 3,
      role: "user",
      content: "Give me an example in C++",
    },
    {
      id: 4,
      role: "assistant",
      content:
        "Sure. Here's a simple recursive function that calculates the factorial of a number. A recursive function has two important parts: a base case, which stops the recursion, and a recursive case, which calls the function again with a smaller problem.",
    },
  ];

  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-amber-200 mx-35 w-full">

      {/* Empty Chat */}
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center">

          <img
            src={VectraLogo}
            alt="Vectra"
            className="mb-6 h-16 w-auto"
          />

          <h1 className="text-4xl font-medium text-white">
            What can I help{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              you build?
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Your AI. Your Keys. Your Control.
          </p>

        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="mx-auto w-full max-w-5xl px-8 py-8">

          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-[75%] rounded-3xl px-5 py-4 ${
                  message.role === "user"
                    ? "bg-[#242938] text-white"
                    : "border border-[#252A36] bg-[#11141C] text-slate-200"
                }`}
              >
                {message.content}
              </div>

            </div>
          ))}

          {/* Scroll Anchor */}
          <div ref={messageEndRef} />

        </div>
      )}

    </div>
  );
};

export default Chats;