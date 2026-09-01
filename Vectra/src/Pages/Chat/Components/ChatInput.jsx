import React from "react";

const ChatInput = () => {
  return (
    <div className="px-6 pb-6 absolute bottom-5 w-180 left-170 ">
      <div className="mx-auto flex h-18 max-w-4xl items-center rounded-full border border-white/10 bg-gradient-to-r from-[#17383d] via-[#24283b] to-[#211936] px-5 shadow-[0_0_30px_rgba(75,0,255,0.08)] backdrop-blur-xl">
        
        {/* Plus */}
        <button className="flex h-10 w-10 shrink-0 items-center justify-center text-3xl font-light text-teal-400 transition hover:text-teal-300">
          +
        </button>

        {/* Input */}
        <input
          type="text"
          placeholder="Message Vectra"
          className="h-full flex-1 bg-transparent px-5 text-lg text-white outline-none placeholder:text-slate-400"
        />

        {/* Send */}
        <button className="flex h-12 w-12 shrink-0 items-center justify-center text-4xl font-light text-purple-400 transition hover:text-purple-300">
          ↑
        </button>

      </div>
    </div>
  );
};

export default ChatInput;