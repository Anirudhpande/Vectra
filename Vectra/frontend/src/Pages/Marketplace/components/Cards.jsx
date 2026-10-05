import React from "react";

const Cards = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-[#11141C] border border-[#252A36] rounded-3xl p-5 h-65 flex flex-col justify-between">
        <div>
          <div className="flex flex-row justify-between items-center">
            <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
              <p className="text-indigo-400 font-bold">AI</p>
            </div>
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full">
              ● Active
            </span>
          </div>

          <p className="text-white text-xl font-bold mt-4">OpenAI API</p>

          <p className="text-slate-500 text-sm mt-1">
            Powerful AI models for text, vision and reasoning.
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-500">⭐ 4.9</span>

            <span className="text-slate-500">12.4k requests</span>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-white font-bold">
              $0.002
              <span className="text-slate-500 text-xs font-normal">
                / request
              </span>
            </p>

            <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm">
              Rent API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cards;
