import React from 'react'
import Home from './Pages/Home/Home'
import Navbar from './Components/Navbar'
import { BrowserRouter, Routes, Route, RouterContextProvider } from 'react-router-dom'
import Marketplace from './Pages/Marketplace/Marketplace'
import Models from './Pages/Models/Models'
import Account from './Pages/Account/Account'
import Chat from './Pages/Chat/Chat'


const App = () => {
  return (
    <BrowserRouter>

      
      <Routes>
        <Route path="/" element={<><Navbar /> <Home /></>}></Route>
        <Route path='/marketplace' element={<> <Marketplace /> </>}></Route>
        <Route path="/models" element={<><Navbar /> <Models /></>}></Route>
        <Route path="/account" element={<> <Navbar /> <Account /></>}></Route>
        <Route path="/chat" element={<Chat />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
