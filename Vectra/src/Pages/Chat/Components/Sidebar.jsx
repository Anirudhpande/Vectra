import { useState } from "react";

const Sidebar = () => {

  return (
    <div className="w-80 bg-gray-900 min-h-screen flex flex-col gap-10">
        <div className="flex flex-row m-4 gap-10">
          <input type="text" className="h-8 w-50 bg-gray-600 rounded-2xl px-3 p-1 text-white outline-none placeholder:text-white" placeholder="Seach"/>
          <button className="bg-gray-500 w-10 h-8 rounded-4xl">☰</button>
        </div>
        <div className="flex flex-col mx-4 justify-start text-xm">
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">New Chat</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Library</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Projects</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Scheduled</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Plugins</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Models</button>
        </div>
        <div className="mx-4 text-gray-400">
          <p>Recents</p>
        </div>
        <div className="flex flex-col mx-4 justify-start text-xm">
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Two Pointer </button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Arrays</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Starting Vectra</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">TailwindCss</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Crazy</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Balls</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">HOTD</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Best Movie Triology</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Bhindi</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Chutmali</button>
          <button className="rounded-3xl hover:bg-gray-600 w-70 h-8 px-3 flex justify-start items-center">Crazy ass Nigga</button>
        </div>

        <div>
          <div className="flex flex-row bg-gray-700 h-15 absolute bottom-0 w-80 p-3 rounded-4xl items-center">
            <img src="" alt="img" 
            className="rounded-3xl flex-1/4 "/>
            <p className="flex-3/4 text-2xl">Anirudh Pandey</p>
          </div>
        </div>
      </div> 
  )
}
export default Sidebar;