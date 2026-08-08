import React from 'react'
import Home from './Pages/Home/Home'
import Navbar from './Components/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Marketplace from './Pages/Marketplace/Marketplace'
import Models from './Pages/Models/Models'
import Account from './Pages/Account/Account'


const App = () => {
  return (
    <BrowserRouter>

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path='/marketplace' element={<Marketplace />}></Route>
        <Route path="/models" element={<Models />}></Route>
        <Route path="/account" element={<Account />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
