import React from 'react'
import Home from './Pages/Home/Home'
import Navbar from './Components/Navbar'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Marketplace from './Pages/Marketplace/Marketplace'
import Account from './Pages/Account/Account'
import Chat from './Pages/Chat/Chat'
import Login from './Pages/Login/Login'
import Credentials from './Pages/Credentials/Credentials'
import ProtectedRoute from './Components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/login" element={<Login />} />

          {/* Marketplace is public — it's a showcase/explorer */}
          <Route path="/marketplace" element={<Marketplace />} />

          {/* Protected routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <><Navbar /><Account /></>
              </ProtectedRoute>
            }
          />
          <Route
            path="/credentials"
            element={
              <ProtectedRoute>
                <><Navbar /><Credentials /></>
              </ProtectedRoute>
            }
          />

          {/* Legacy /models route — redirect to credentials */}
          <Route path="/models" element={<Navigate to="/credentials" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
